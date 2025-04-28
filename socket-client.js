const { io } = require('socket.io-client');

// ==================== НАСТРОЙКИ ====================
const SERVER_URL = 'http://localhost:6000'; // Адрес сервера
const LOBBY_CODE = 'f2abf3'; // Код твоего лобби
const HOST_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGZmMjk4NzVjNzc0MWQwODQzNTUyYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDU4NzU2MDksImV4cCI6MTc0NjQ4MDQwOX0.LqmdpNMgIuYbmXZcqcOSjjiIrOceIU6xX-gd02Q1dlY'; // Токен хоста (обрежь для безопасности)

// Игроки
const players = [
  { nickname: 'HostPlayer', walletAddress: 'EQ_Host_Wallet_Address', isHost: true },
  { nickname: 'PlayerTwo', walletAddress: 'EQ_PlayerTwo_Wallet', isHost: false },
  { nickname: 'PlayerThree', walletAddress: 'EQ_PlayerThree_Wallet', isHost: false }
];

const sockets = [];
let isQuizStarted = false;

// ==================== КЛИЕНТСКАЯ ЛОГИКА ====================

players.forEach((player) => {
  const socket = io(SERVER_URL, { transports: ['websocket'] });
  sockets.push(socket);

  socket.on('connect', () => {
    console.log(`✅ ${player.nickname} connected`);

    socket.emit('joinLobby', {
      lobbyCode: LOBBY_CODE,
      nickname: player.nickname,
      walletAddress: player.walletAddress
    });
  });

  socket.on('joinedLobby', (data) => {
    console.log(`🎉 ${player.nickname} joined lobby`);

    if (player.isHost && !isQuizStarted) {
      setTimeout(() => {
        console.log(`🚀 ${player.nickname} starting the quiz`);
        socket.emit('startQuiz', {
          lobbyCode: LOBBY_CODE,
          token: HOST_TOKEN
        });
        isQuizStarted = true;
      }, 3000); // Небольшая задержка чтобы все успели зайти
    }
  });

  socket.on('quizStarted', () => {
    console.log(`🔥 Quiz started for ${player.nickname}`);
  });

  socket.on('newQuestion', (question) => {
    console.log(`🧠 ${player.nickname} received question: ${question.questionText}`);

    // Определяем правильный ответ
    let selectedAnswers = [];

    if (question.questionText.includes('HTTP')) {
      selectedAnswers = [0];
    } else if (question.questionText.includes('стилизации веб-страниц')) {
      selectedAnswers = [1];
    } else if (question.questionText.includes('IP-адрес')) {
      selectedAnswers = [2];
    } else if (question.questionText.includes("'true' в языке JavaScript")) {
      selectedAnswers = [1];
    } else if (question.questionText.includes('git clone')) {
      selectedAnswers = [1];
    } else {
      selectedAnswers = [0]; // На всякий случай
    }

    const randomDelay = Math.floor(Math.random() * 2000) + 3000; // Отвечаем через 3-5 секунд

    setTimeout(() => {
      console.log(`✍️ ${player.nickname} sending answer: ${selectedAnswers}`);
      socket.emit('sendAnswer', {
        lobbyCode: LOBBY_CODE,
        nickname: player.nickname,
        selectedAnswers: selectedAnswers
      });
    }, randomDelay);
  });

  socket.on('playerAnswered', (data) => {
    console.log(`✅ ${data.nickname} answered`);
  });

  socket.on('quizEnded', (data) => {
    console.log(`🏁 Quiz ended for ${player.nickname}`);
    console.log('🏆 Final results:', data.results);

    setTimeout(() => {
      socket.disconnect();
    }, 2000);
  });

  socket.on('errorMessage', (error) => {
    console.error(`❌ Error for ${player.nickname}: ${error.message}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 ${player.nickname} disconnected`);
  });
});
