const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby');
const Quiz = require('../models/Quiz');
const crypto = require('crypto');


router.post('/', async (req, res) => {
    try {
        const { quizId, baseReward } = req.body;

        if (!quizId || !baseReward) {
            return res.status(400).json({ success: false, message: 'Quiz ID and baseReward are required' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const code = crypto.randomBytes(3).toString('hex');

        const newLobby = new Lobby({
            code,
            quiz: quiz._id,
            host: req.user.userId,
            players: [],
            started: false,
            baseReward
        });

        await newLobby.save();

        res.status(201).json({ success: true, code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Присоединение к лобби по коду
router.post('/:code/join', async (req, res) => {
    try {
        const { nickname } = req.body;
        const { code } = req.params;

        if (!nickname) {
            return res.status(400).json({ success: false, message: 'Nickname is required' });
        }

        const lobby = await Lobby.findOne({ code });
        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        lobby.players.push({ nickname, score: 0, currentQuestion: 0 });
        await lobby.save();

        res.status(200).json({ success: true, message: 'Joined the lobby successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Получение информации о лобби
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const lobby = await Lobby.findOne({ code }).populate('quiz', 'title description questions');

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        res.status(200).json({ success: true, lobby });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Старт квиза в лобби
router.post('/:code/start', async (req, res) => {
    try {
        const { code } = req.params;

        const lobby = await Lobby.findOne({ code });

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        if (lobby.host.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Only the host can start the quiz' });
        }

        if (lobby.started) {
            return res.status(400).json({ success: false, message: 'Quiz already started' });
        }

        lobby.started = true;
        await lobby.save();

        res.status(200).json({ success: true, message: 'Quiz started successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Ответ игрока на вопрос
router.post('/:code/answer', async (req, res) => {
    try {
        const { code } = req.params;
        const { nickname, selectedAnswers } = req.body;

        if (!nickname || !Array.isArray(selectedAnswers)) {
            return res.status(400).json({ success: false, message: 'Nickname and selectedAnswers are required' });
        }

        const lobby = await Lobby.findOne({ code }).populate('quiz');

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        if (!lobby.started) {
            return res.status(400).json({ success: false, message: 'Quiz has not started yet' });
        }

        const player = lobby.players.find(p => p.nickname === nickname);
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found in this lobby' });
        }

        const question = lobby.quiz.questions[player.currentQuestion];
        if (!question) {
            return res.status(400).json({ success: false, message: 'No more questions' });
        }

        const correctAnswers = question.correctAnswers
            .map((isCorrect, idx) => isCorrect ? idx : null)
            .filter(idx => idx !== null)
            .sort();

        const playerAnswers = selectedAnswers.sort();

        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(playerAnswers);

        if (isCorrect) {
            player.streak += 1;

            // Теперь используем базовую награду из лобби
            const reward = Math.floor(lobby.baseReward * Math.pow(1.1, player.streak - 1));
            player.score += reward;
        } else {
            player.streak = 0; // Сброс стрика
        }

        player.currentQuestion += 1;

        await lobby.save();

        const hasMoreQuestions = player.currentQuestion < lobby.quiz.questions.length;

        res.status(200).json({
            success: true,
            correct: isCorrect,
            score: player.score,
            streak: player.streak,
            hasMoreQuestions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Получение результатов квиза
router.get('/:code/results', async (req, res) => {
    try {
        const { code } = req.params;

        const lobby = await Lobby.findOne({ code });

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        const results = lobby.players
            .map(player => ({
                nickname: player.nickname,
                score: player.score,
                streak: player.streak
            }))
            .sort((a, b) => b.score - a.score); // Сортируем по убыванию очков

        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
