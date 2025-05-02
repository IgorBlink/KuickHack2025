const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:6000';
const LOBBY_CODE = '132e5a'; // Заменить на актуальный код
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGZmMjk4NzVjNzc0MWQwODQzNTUyYiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDYxNjMxNTcsImV4cCI6MTc0Njc2Nzk1N30.NPBEyJN36NfZAUOekkpxp3Jb6jbD2YGuuGCveuXtk68'; // Заменить на токен хоста

function getRandomAnswers(optionsLength, maxSelect = 1) {
  const indices = Array.from({ length: optionsLength }, (_, i) => i);
  const count = Math.min(maxSelect, optionsLength);
  const shuffled = indices.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).sort((a, b) => a - b);
}

function createPlayer(nickname, autoAnswer = true) {
  const socket = io(SERVER_URL);

  socket.on('connect', () => {
    console.log(`✅ ${nickname} connected`);
    socket.emit('joinLobby', { lobbyCode: LOBBY_CODE, nickname });
  });

  socket.on('joinedLobby', () => {
    console.log(`🎉 ${nickname} joined lobby`);
  });

  socket.on('newQuestion', ({ index, questionText, options }) => {
    console.log(`🧠 [${nickname}] Q${index + 1}: ${questionText}`);
    if (autoAnswer) {
      setTimeout(() => {
        const selectedAnswers = getRandomAnswers(options.length);
        console.log(`[DEBUG] ${nickname} selectedAnswers:`, selectedAnswers);

        socket.emit('sendAnswer', {
          lobbyCode: LOBBY_CODE,
          nickname,
          selectedAnswers
        });

        console.log(`✍️ [${nickname}] answered: ${selectedAnswers}`);
      }, 1500 + Math.random() * 1500);
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
    socket.emit('joinLobby', { lobbyCode: LOBBY_CODE, nickname, token: TOKEN });
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
