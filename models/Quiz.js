const { Schema, model } = require("mongoose");

const QuestionSchema = new Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String], // варианты ответа
        required: true
    },
    correctAnswers: {
        type: [Boolean], // правильные ответы в виде true/false
        required: true
    }
}, { _id: false });

const QuizSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: {
        type: [QuestionSchema],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = model('Quiz', QuizSchema);
