const { Schema, model } = require("mongoose");

const AnswerSchema = new Schema({
    questionIndex: { type: Number, required: true },
    selectedAnswers: { type: [Number], required: true },
    isCorrect: { type: Boolean, required: true }
}, { _id: false });
  
const PlayerSchema = new Schema({
    nickname: { type: String, required: true },
    score: { type: Number, default: 0 },
    currentQuestion: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    answers: { type: [AnswerSchema], default: [] }
}, { _id: false });

const LobbySchema = new Schema({
  code: { type: String, required: true, unique: true },
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  players: [PlayerSchema],
  started: { type: Boolean, default: false },
  currentQuestionIndex: { type: Number, default: 0 },

  baseReward: { type: Number, default: 300 }, // всегда фиксированное значение
  sendingQuestion: { type: Boolean, default: false },
  
  quizEnded: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Lobby', LobbySchema);
