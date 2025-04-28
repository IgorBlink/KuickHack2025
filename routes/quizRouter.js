const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// Создание нового квиза
router.post('/', async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Title and questions are required' });
        }

        // Мини проверка каждого вопроса
        for (const question of questions) {
            if (
                !question.questionText ||
                !Array.isArray(question.options) ||
                question.options.length === 0 ||
                !Array.isArray(question.correctAnswers) ||
                question.options.length !== question.correctAnswers.length
            ) {
                return res.status(400).json({ success: false, message: 'Each question must have questionText, options, and correctAnswers with same length' });
            }
        }

        const quiz = new Quiz({
            title,
            description,
            questions,
            createdBy: req.user.id // Берём userId из токена
        });

        await quiz.save();

        res.status(201).json({ success: true, message: 'Quiz created successfully', quizId: quiz._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find().select("title description createdAt");
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const quiz = await Quiz.findById(id);

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        res.status(200).json({ success: true, quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
