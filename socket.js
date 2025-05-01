const { Server } = require('socket.io');
const jwt = require('./utils/jwt');
const Lobby = require('./models/Lobby');

const questionTimers = new Map(); // хранит таймеры по lobbyCode

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    socket.on('joinLobby', async ({ lobbyCode, nickname, token }) => {
      try {
        if (!lobbyCode || !nickname) {
          return socket.emit('errorMessage', { message: 'Invalid join data' });
        }

        const lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
        if (!lobby) return socket.emit('errorMessage', { message: 'Lobby not found' });

        if (lobby.players.find(p => p.nickname === nickname)) {
          return socket.emit('errorMessage', { message: 'Nickname already taken' });
        }

        let isHost = false;
        if (token) {
          try {
            const payload = await jwt.verifyToken(token.replace('Bearer ', ''));
            if (payload.id === lobby.host.toString()) {
              isHost = true;
            }
          } catch (err) {
            console.warn('⚠️ Invalid token in joinLobby:', err.message);
          }
        }

        lobby.players.push({
          nickname,
          isHost,
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
        if (alreadyAnswered) return;

        const correctAnswers = question.correctAnswers
          .map((isCorrect, idx) => isCorrect ? idx : null)
          .filter(idx => idx !== null)
          .sort();

        const playerAnswers = [...selectedAnswers].sort();

        const fullMatch = JSON.stringify(correctAnswers) === JSON.stringify(playerAnswers);
        const partialMatch = playerAnswers.length > 0 && playerAnswers.every(ans => correctAnswers.includes(ans));

        const baseReward = lobby.baseReward || 300;
        const isCorrect = fullMatch;

        console.log(`[DEBUG] ${nickname} | correct: ${JSON.stringify(correctAnswers)} | selected: ${JSON.stringify(playerAnswers)} | isCorrect: ${isCorrect} | partial: ${partialMatch}`);

        if (fullMatch) {
          player.streak += 1;
          const reward = Math.floor(baseReward * Math.pow(1.1, player.streak - 1));
          player.score += reward;
        } else if (partialMatch) {
          player.streak = 0;
          player.score += Math.floor(baseReward / 2);
        } else {
          player.streak = 0;
        }

        player.currentQuestion = currentIndex + 1;
        player.lastAnsweredQuestionIndex = currentIndex;
        player.answers.push({ questionIndex: currentIndex, selectedAnswers, isCorrect });

        lobby.markModified(`players.${playerIndex}`);
        await lobby.save();

        io.to(lobbyCode).emit('playerAnswered', { nickname });

        const updatedLobby = await Lobby.findOne({ code: lobbyCode });
        const answeringPlayers = updatedLobby.players.filter(p => !p.isHost);

        const stillAnswering = answeringPlayers.some(
          p => !p.answers.some(a => a.questionIndex === currentIndex)
        );

        if (!stillAnswering) {
          if (questionTimers.has(lobbyCode)) {
            clearTimeout(questionTimers.get(lobbyCode));
            questionTimers.delete(lobbyCode);
            console.log(`✅ Все ответили. Таймер остановлен [${lobbyCode}]`);
          }

          await sendNextQuestion(io, lobbyCode);
        }
      } catch (error) {
        console.error('❌ Send Answer Error:', error.message);
        socket.emit('errorMessage', { message: 'Failed to submit answer' });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}

async function sendNextQuestion(io, lobbyCode) {
  let lobby = null;

  try {
    lobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
    if (!lobby || lobby.quizEnded || lobby.sendingQuestion) return;

    lobby.sendingQuestion = true;
    await lobby.save();

    if (lobby.currentQuestionIndex >= lobby.quiz.questions.length) {
      lobby.quizEnded = true;

      const results = lobby.players.map(p => ({
        nickname: p.nickname,
        score: p.score,
        streak: p.streak
      })).sort((a, b) => b.score - a.score);

      io.to(lobbyCode).emit('quizEnded', { results });
      lobby.sendingQuestion = false;
      await lobby.save();
      return;
    }

    const currentIndex = lobby.currentQuestionIndex;
    const question = lobby.quiz.questions[currentIndex];

    io.to(lobbyCode).emit('newQuestion', {
      index: currentIndex,
      questionText: question.questionText,
      options: question.options
    });

    lobby.currentQuestionIndex += 1;
    lobby.sendingQuestion = false;
    await lobby.save();

    if (questionTimers.has(lobbyCode)) {
      clearTimeout(questionTimers.get(lobbyCode));
    }

    const timer = setTimeout(async () => {
      console.log(`⏰ Время вышло. Засчитываем всем "не ответил" [${lobbyCode}]`);

      const expiredLobby = await Lobby.findOne({ code: lobbyCode }).populate('quiz');
      if (!expiredLobby) return;

      const questionIndex = expiredLobby.currentQuestionIndex - 1;
      expiredLobby.players.forEach((player, i) => {
        if (!player.isHost && !player.answers.some(a => a.questionIndex === questionIndex)) {
          player.streak = 0;
          player.answers.push({
            questionIndex,
            selectedAnswers: [],
            isCorrect: false
          });
          expiredLobby.markModified(`players.${i}`);
          console.log(`[TIMEOUT] ${player.nickname} не ответил на ${questionIndex}. Засчитано как неверный.`);
        }
      });

      await expiredLobby.save();
      await sendNextQuestion(io, lobbyCode);
    }, 30000);

    questionTimers.set(lobbyCode, timer);
  } catch (error) {
    console.error('Send Next Question Error:', error.message);
    if (lobby) {
      lobby.sendingQuestion = false;
      await lobby.save();
    }
  }
}

module.exports = { setupSocket };
