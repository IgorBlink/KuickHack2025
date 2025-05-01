const { Server } = require('socket.io');
const jwt = require('./utils/jwt');
const Lobby = require('./models/Lobby');

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    socket.on('joinLobby', async ({ lobbyCode, nickname }) => {
      try {
        if (!lobbyCode || !nickname) {
          return socket.emit('errorMessage', { message: 'Invalid join data' });
        }

        const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
        if (!lobby) return socket.emit('errorMessage', { message: 'Lobby not found' });

        if (lobby.players.find(p => p.nickname === nickname)) {
          return socket.emit('errorMessage', { message: 'Nickname already taken' });
        }

        lobby.players.push({
          nickname,
          score: 0,
          streak: 0,
          currentQuestion: 0,
          lastAnsweredQuestionIndex: -1,
          answers: []
        });

        await lobby.save();
        socket.join(lobbyCode);

        socket.emit('joinedLobby', { lobbyCode: lobby.code });
        io.to(lobbyCode).emit('playerJoined', { nickname });
      } catch (error) {
        console.error('Join Lobby Error:', error.message);
        socket.emit('errorMessage', { message: 'Failed to join lobby' });
      }
    });

    socket.on('startQuiz', async ({ lobbyCode, token }) => {
      try {
        const payload = await jwt.verifyToken(token.replace('Bearer ', ''));
        const userId = payload.id;

        const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
        if (!lobby) return socket.emit('errorMessage', { message: 'Lobby not found' });
        if (lobby.host.toString() !== userId) return socket.emit('errorMessage', { message: 'Only host can start the quiz' });
        if (lobby.started) return socket.emit('errorMessage', { message: 'Quiz already started' });

        lobby.started = true;
        lobby.currentQuestionIndex = 0;
        lobby.quizEnded = false;
        await lobby.save();

        io.to(lobbyCode).emit('quizStarted');
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
    
        const currentIndex = lobby.currentQuestionIndex - 1;
        const question = lobby.quiz.questions[currentIndex];
        if (!question) {
          return socket.emit('errorMessage', { message: 'No question found' });
        }
    
        const playerIndex = lobby.players.findIndex(p => p.nickname === nickname);
        if (playerIndex === -1) {
          return socket.emit('errorMessage', { message: 'Player not found in lobby' });
        }
    
        const player = lobby.players[playerIndex];
    
        const alreadyAnswered = player.answers.some(a => a.questionIndex === currentIndex);
        if (alreadyAnswered) return; // не даём отвечать дважды
    
        const correctAnswers = question.correctAnswers
          .map((isCorrect, idx) => (isCorrect ? idx : null))
          .filter(idx => idx !== null)
          .sort();
    
        const playerAnswers = [...selectedAnswers].sort();
        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(playerAnswers);
    
        if (isCorrect) {
          player.streak += 1;
          const reward = Math.floor(300 * Math.pow(1.1, player.streak - 1));
          player.score += reward;
        } else {
          player.streak = 0;
        }
    
        player.currentQuestion = lobby.currentQuestionIndex;
        player.lastAnsweredQuestionIndex = currentIndex;
        player.answers.push({
          questionIndex: currentIndex,
          selectedAnswers,
          isCorrect
        });
    
        lobby.markModified(`players.${playerIndex}`); // обязательно!
        await lobby.save();
    
        io.to(lobbyCode).emit('playerAnswered', { nickname });
    
        const updatedLobby = await Lobby.findOne({ code: lobbyCode });
        const stillAnswering = updatedLobby.players.some(
          p => p.currentQuestion < updatedLobby.currentQuestionIndex
        );
    
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
  const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
  if (!lobby || lobby.quizEnded) return;

  if (lobby.currentQuestionIndex >= lobby.quiz.questions.length) {
    lobby.quizEnded = true;
    await lobby.save();

    const results = lobby.players
      .map(p => ({ nickname: p.nickname, score: p.score, streak: p.streak }))
      .sort((a, b) => b.score - a.score);

    io.to(lobbyCode).emit('quizEnded', { results });
    return;
  }

  const q = lobby.quiz.questions[lobby.currentQuestionIndex];
  io.to(lobbyCode).emit('newQuestion', {
    index: lobby.currentQuestionIndex,
    questionText: q.questionText,
    options: q.options
  });

  lobby.currentQuestionIndex += 1;
  await lobby.save();
}

module.exports = { setupSocket };
