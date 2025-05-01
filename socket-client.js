const { io } = require('socket.io-client');

// ===== НАСТРОЙКИ =====
const SERVER_URL = 'http://localhost:6000';
const LOBBY_CODE = 'c96de3'; // замените на актуальный код лобби
const HOST_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGZmMjk4NzVjNzc0MWQwODQzNTUyYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDYwODk2MjMsImV4cCI6MTc0NjY5NDQyM30.cDBqCkpzXaXC9gwGxvbG_GnXxuJv8bCacpmptmFk7K0'; // замените на актуальный токен

const players = [
  { nickname: 'PlayerOne' },
  { nickname: 'PlayerTwo' },
  { nickname: 'PlayerThree' }
];

const sockets = [];
let isQuizStarted = false;
let hasQuizEnded = false;

players.forEach((player, index) => {
  const socket = io(SERVER_URL, { transports: ['websocket'] });
  sockets.push(socket);

  socket.on('connect', () => {
    console.log(`✅ ${player.nickname} connected`);
    socket.emit('joinLobby', {
      lobbyCode: LOBBY_CODE,
      nickname: player.nickname
    });
  });

  socket.on('joinedLobby', () => {
    console.log(`🎉 ${player.nickname} joined lobby`);

    if (index === 0 && !isQuizStarted) {
      setTimeout(() => {
        console.log(`🚀 ${player.nickname} starting the quiz`);
        socket.emit('startQuiz', {
          lobbyCode: LOBBY_CODE,
          token: HOST_TOKEN
        });
        isQuizStarted = true;
      }, 3000);
    }
  });

  socket.on('quizStarted', () => {
    console.log(`🔥 Quiz started for ${player.nickname}`);
  });

  socket.on('newQuestion', (question) => {
    console.log(`🧠 ${player.nickname} received question: ${question.questionText}`);

    const totalOptions = question.options.length;
    const selectedAnswers = [Math.floor(Math.random() * totalOptions)];

    setTimeout(() => {
      console.log(`✍️ ${player.nickname} answering: ${selectedAnswers}`);
      socket.emit('sendAnswer', {
        lobbyCode: LOBBY_CODE,
        nickname: player.nickname,
        selectedAnswers
      });
    }, Math.floor(Math.random() * 2000) + 1000);
  });

  socket.on('playerAnswered', (data) => {
    console.log(`✅ ${data.nickname} answered`);
  });

  socket.on('quizEnded', (data) => {
    if (hasQuizEnded) return;
    hasQuizEnded = true;
  
    console.log(`🏁 Quiz ended for ${player.nickname}`);
    if (index === 0) console.log('🏆 Results:', data.results);
  
    setTimeout(() => socket.disconnect(), 2000);
  });

  socket.on('errorMessage', (error) => {
    console.error(`❌ Error for ${player.nickname}: ${error.message}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 ${player.nickname} disconnected`);
  });
});
