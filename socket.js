const { Server } = require('socket.io');
const jwt = require('./utils/jwt');
const Lobby = require('./models/Lobby');
const Quiz = require('./models/Quiz');

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    socket.on('joinLobby', async ({ lobbyCode, nickname, walletAddress }) => {
      try {
        if (!lobbyCode || !nickname || !walletAddress) {
          return socket.emit('errorMessage', { message: 'Invalid join data' });
        }

        const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
        if (!lobby) {
          return socket.emit('errorMessage', { message: 'Lobby not found' });
        }

        if (lobby.players.find(p => p.nickname === nickname)) {
          return socket.emit('errorMessage', { message: 'Nickname already taken' });
        }

        lobby.players.push({
          nickname,
          walletAddress,
          score: 0,
          currentQuestion: 0,
          streak: 0
        });

        await lobby.save();

        socket.join(lobbyCode);

        socket.emit('joinedLobby', {
          lobbyCode: lobby.code,
          hostNickname: lobby.host.nickname,
          message: 'Successfully joined lobby'
        });

        io.to(lobbyCode).emit('playerJoined', { nickname });
      } catch (error) {
        console.error('Join Lobby Error:', error.message);
        socket.emit('errorMessage', { message: 'Failed to join lobby' });
      }
    });

    socket.on('startQuiz', async ({ lobbyCode, token }) => {
      try {
        if (!token) {
          return socket.emit('errorMessage', { message: 'Unauthorized: Token required' });
        }

        const payload = await jwt.verifyToken(token.replace('Bearer ', ''));
        const userId = payload.id;

        const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
        if (!lobby) {
          return socket.emit('errorMessage', { message: 'Lobby not found' });
        }

        if (lobby.host.toString() !== userId) {
          return socket.emit('errorMessage', { message: 'Only host can start the quiz' });
        }

        if (lobby.started) {
          return socket.emit('errorMessage', { message: 'Quiz already started' });
        }

        lobby.started = true;
        lobby.currentQuestionIndex = 0;
        await lobby.save();

        io.to(lobbyCode).emit('quizStarted', { message: 'Quiz started!' });

        await sendNextQuestion(io, lobbyCode);
      } catch (error) {
        console.error('Start Quiz Error:', error.message);
        socket.emit('errorMessage', { message: 'Failed to start quiz' });
      }
    });

    socket.on('sendAnswer', async ({ lobbyCode, nickname, selectedAnswers }) => {
        try {
          const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
          if (!lobby || !lobby.started) {
            return socket.emit('errorMessage', { message: 'Lobby not found or quiz not started' });
          }
      
          const player = lobby.players.find(p => p.nickname === nickname);
          if (!player) {
            return socket.emit('errorMessage', { message: 'Player not found in lobby' });
          }
      
          const questionIndex = lobby.currentQuestionIndex - 1;
          const question = lobby.quiz.questions[questionIndex];
      
          if (!question) {
            return socket.emit('errorMessage', { message: 'No question found' });
          }
      
          const correctAnswers = question.correctAnswers
            .map((isCorrect, idx) => isCorrect ? idx : null)
            .filter(idx => idx !== null)
            .sort();
      
          const playerAnswers = selectedAnswers.sort();
          const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(playerAnswers);
      
          if (isCorrect) {
            player.streak += 1;
            const reward = Math.floor(lobby.baseReward * Math.pow(1.1, player.streak - 1));
            player.score += reward;
          } else {
            player.streak = 0;
          }
      
          player.currentQuestion = lobby.currentQuestionIndex;
      
          await lobby.save();
      
          io.to(lobbyCode).emit('playerAnswered', { nickname });
      
          const updatedLobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
          const stillAnswering = updatedLobby.players.some(p => p.currentQuestion < updatedLobby.currentQuestionIndex);
      
          if (!stillAnswering) {
            await sendNextQuestion(io, lobbyCode);
          }
      
        } catch (error) {
          console.error('Send Answer Error:', error.message);
          socket.emit('errorMessage', { message: 'Failed to submit answer' });
        }
    });      
      
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}

async function sendNextQuestion(io, lobbyCode) {
  try {
    const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
    if (!lobby) return;

    lobby.currentQuestionIndex = lobby.currentQuestionIndex || 0;

    if (lobby.currentQuestionIndex >= lobby.quiz.questions.length) {
      const results = lobby.players
        .map(player => ({
          nickname: player.nickname,
          score: player.score,
          streak: player.streak
        }))
        .sort((a, b) => b.score - a.score);

      io.to(lobbyCode).emit('quizEnded', { results });
      return;
    }

    const question = lobby.quiz.questions[lobby.currentQuestionIndex];

    io.to(lobbyCode).emit('newQuestion', {
      index: lobby.currentQuestionIndex,
      questionText: question.questionText,
      options: question.options
    });

    lobby.currentQuestionIndex += 1;
    await lobby.save();
  } catch (error) {
    console.error('Send Next Question Error:', error.message);
  }
}

module.exports = { setupSocket };
