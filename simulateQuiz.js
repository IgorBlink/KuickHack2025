const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:6000';
const LOBBY_CODE = 'e2a67a'; // Заменить на актуальный код
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGZmMjk4NzVjNzc0MWQwODQzNTUyYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDYwODk2MjMsImV4cCI6MTc0NjY5NDQyM30.cDBqCkpzXaXC9gwGxvbG_GnXxuJv8bCacpmptmFk7K0'; // Заменить на токен хоста

function createPlayer(nickname, autoAnswer = true) {
  const socket = io(SERVER_URL);
  let lastQuestionIndex = -1;

  socket.on('connect', () => {
    console.log(`✅ ${nickname} connected`);
    socket.emit('joinLobby', { lobbyCode: LOBBY_CODE, nickname });
  });

  socket.on('joinedLobby', () => {
    console.log(`🎉 ${nickname} joined lobby`);
  });

  socket.on('newQuestion', ({ index, questionText, options }) => {
    if (index === lastQuestionIndex) return; // уже отвечали
    lastQuestionIndex = index;

    console.log(`🧠 [${nickname}] Q${index + 1}: ${questionText}`);
    if (autoAnswer) {
      setTimeout(() => {
        const selectedAnswers = [Math.floor(Math.random() * options.length)];
        socket.emit('sendAnswer', { lobbyCode: LOBBY_CODE, nickname, selectedAnswers });
        console.log(`✍️ [${nickname}] answered: ${selectedAnswers}`);
      }, 1000 + Math.random() * 1000);
    }
  });

  socket.on('quizEnded', ({ results }) => {
    console.log(`🏁 [${nickname}] Quiz ended! Results:`, results);
  });

  socket.on('errorMessage', ({ message }) => {
    console.error(`❌ [${nickname}]`, message);
  });
}

function createHost() {
  const socket = io(SERVER_URL);
  const nickname = 'Host';

  socket.on('connect', () => {
    console.log(`👑 ${nickname} connected`);
    socket.emit('joinLobby', { lobbyCode: LOBBY_CODE, nickname });
  });

  socket.on('joinedLobby', () => {
    console.log(`🚀 ${nickname} starting quiz...`);
    setTimeout(() => {
      socket.emit('startQuiz', { lobbyCode: LOBBY_CODE, token: TOKEN });
    }, 2000);
  });

  socket.on('errorMessage', ({ message }) => {
    console.error(`❌ [${nickname}]`, message);
  });
}

// === START SIMULATION ===
createHost();

setTimeout(() => createPlayer('PlayerOne'), 1000);
setTimeout(() => createPlayer('PlayerTwo'), 1500);
setTimeout(() => createPlayer('PlayerThree'), 2000);
