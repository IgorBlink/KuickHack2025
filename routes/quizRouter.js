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

router.post('/ai', async (req, res) => {
    try {
        const { topic, quantity = 5 } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, message: 'Topic is required' });
        }

        const safeQuantity = Math.min(Math.max(parseInt(quantity), 1), 20);

        const prompt = `Generate ${safeQuantity} multiple-choice questions on the topic "${topic}". 
The format must be strict JSON: [{"questionText": "...", "options": ["..."], "correctAnswers": [true, false, ...]}]. 
Do not include any text except the JSON.`;

        const fetchResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!fetchResponse.ok) {
            console.log('Error fetching from Gemini API:', fetchResponse.status, await fetchResponse.text());
            return res.status(fetchResponse.status).json({ success: false, message: 'Failed to fetch from Gemini API' });
        }

        const data = await fetchResponse.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return res.status(500).json({ success: false, message: 'Gemini API returned no text' });
        }

        const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/```([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : rawText;

        let questions;
        try {
            questions = JSON.parse(jsonStr);
        } catch (e) {
            return res.status(500).json({ success: false, message: 'Failed to parse JSON from Gemini response', raw: rawText });
        }

        for (const q of questions) {
            if (
                !q.questionText ||
                !Array.isArray(q.options) ||
                q.options.length === 0 ||
                !Array.isArray(q.correctAnswers) ||
                q.options.length !== q.correctAnswers.length
            ) {
                return res.status(400).json({ success: false, message: 'Invalid question format', question: q });
            }
        };

        console.log(req.user);

        const quiz = new Quiz({
            title: `AI Quiz: ${topic}`,
            description: `Automatically generated on topic "${topic}"`,
            questions,
            createdBy: req.user.userId
        });

        await quiz.save();

        res.status(201).json({
            success: true,
            message: 'Quiz generated and saved successfully',
            quizId: quiz._id,
            questions: quiz.questions
        });
    } catch (error) {
        console.error('Error:', error);
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
