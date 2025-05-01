const { Server } = require('socket.io');
const jwt = require('./utils/jwt');
const Lobby = require('./models/Lobby');

const questionTimers = new Map(); // ⏱ хранит таймеры по lobbyCode

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

        player.currentQuestion = currentIndex + 1;
        player.lastAnsweredQuestionIndex = currentIndex;
        player.answers.push({
          questionIndex: currentIndex,
          selectedAnswers,
          isCorrect
        });

        lobby.markModified(`players.${playerIndex}`);
        await lobby.save();

        io.to(lobbyCode).emit('playerAnswered', { nickname });

        const updatedLobby = await Lobby.findOne({ code: lobbyCode });
        const answeringPlayers = updatedLobby.players.filter(p => !p.isHost);

        console.log(`📊 Проверка: ответили ли все на вопрос ${currentIndex}`);
        answeringPlayers.forEach(p => {
          const answered = p.answers.some(a => a.questionIndex === currentIndex);
          console.log(`- ${p.nickname}: ${answered ? '✅' : '❌'}`);
        });

        const stillAnswering = answeringPlayers.some(
          p => !p.answers.some(a => a.questionIndex === currentIndex)
        );

        if (!stillAnswering) {
          // ⏱ Очистить таймер, если все ответили
          if (questionTimers.has(lobbyCode)) {
            clearTimeout(questionTimers.get(lobbyCode));
            questionTimers.delete(lobbyCode);
            console.log(`✅ Все ответили. Таймер остановлен [${lobbyCode}]`);
          }

          console.log('✅ Все игроки ответили. Отправляем следующий вопрос...');
          await sendNextQuestion(io, lobbyCode);
        } else {
          console.log('⏳ Ждём остальных игроков...');
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

      const results = lobby.players
        .map(player => ({
          nickname: player.nickname,
          score: player.score,
          streak: player.streak
        }))
        .sort((a, b) => b.score - a.score);

      io.to(lobbyCode).emit('quizEnded', { results });

      lobby.sendingQuestion = false;
      await lobby.save();
      return;
    }

    const currentIndex = lobby.currentQuestionIndex;

    lobby.players.forEach((player, i) => {
      const hasAnswered = player.answers.some(a => a.questionIndex === currentIndex);
      if (!hasAnswered && !player.isHost) {
        player.streak = 0;
        player.answers.push({
          questionIndex: currentIndex,
          selectedAnswers: [],
          isCorrect: false
        });
        lobby.markModified(`players.${i}`);
      }
    });

    const question = lobby.quiz.questions[currentIndex];

    io.to(lobbyCode).emit('newQuestion', {
      index: lobby.currentQuestionIndex,
      questionText: question.questionText,
      options: question.options
    });

    lobby.currentQuestionIndex += 1;
    lobby.sendingQuestion = false;
    await lobby.save();

    // ⏱ Устанавливаем таймер на 30 сек для следующего вопроса
    if (questionTimers.has(lobbyCode)) {
      clearTimeout(questionTimers.get(lobbyCode));
    }

    const timer = setTimeout(async () => {
      console.log(`⏰ Время вышло. Переход к следующему вопросу [${lobbyCode}]`);
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
