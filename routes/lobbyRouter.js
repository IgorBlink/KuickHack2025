const express = require('express');
const crypto = require('crypto');
const Lobby = require('../models/Lobby');
const Quiz = require('../models/Quiz');

const router = express.Router();

// Фиксированная комиссия сервиса (%)
const COMMISSION_PERCENT = 5;

router.post('/', async (req, res) => {
    try {
        const { quizId, baseReward, withReward, rewardBalance } = req.body;

        if (!quizId || !baseReward || typeof withReward !== 'boolean') {
            return res.status(400).json({ success: false, message: 'quizId, baseReward and withReward are required' });
        }

        if (withReward && (!rewardBalance || rewardBalance <= 0)) {
            return res.status(400).json({ success: false, message: 'Reward balance is required if withReward is true' });
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
            baseReward,
            withReward,
            rewardBalance: withReward ? rewardBalance : 0,
            paid: !withReward,
        });

        await newLobby.save();

        res.status(201).json({ success: true, code, lobbyId: newLobby._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:code/join', async (req, res) => {
    try {
        const { code } = req.params;
        const { nickname, walletAddress } = req.body;

        if (!nickname || !walletAddress) {
            return res.status(400).json({ success: false, message: 'Nickname and walletAddress are required' });
        }

        const lobby = await Lobby.findOne({ code });

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        if (lobby.players.find(p => p.nickname === nickname)) {
            return res.status(400).json({ success: false, message: 'Nickname already taken in this lobby' });
        }

        lobby.players.push({
            nickname,
            walletAddress,
            score: 0,
            currentQuestion: 0,
            streak: 0
        });

        await lobby.save();

        res.status(200).json({ success: true, message: 'Joined lobby successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const lobby = await Lobby.findOne({ code }).populate('quiz');

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        res.status(200).json({
            success: true,
            lobby: {
                code: lobby.code,
                quiz: {
                    title: lobby.quiz.title,
                    description: lobby.quiz.description,
                    questionsCount: lobby.quiz.questions.length
                },
                players: lobby.players.map(p => ({ nickname: p.nickname })),
                withReward: lobby.withReward,
                rewardBalance: lobby.rewardBalance,
                paid: lobby.paid,
                started: lobby.started
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:code/start', async (req, res) => {
    try {
        const { code } = req.params;

        const lobby = await Lobby.findOne({ code });

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        if (lobby.started) {
            return res.status(400).json({ success: false, message: 'Lobby already started' });
        }

        if (lobby.withReward && !lobby.paid) {
            return res.status(400).json({ success: false, message: 'Reward payment is not completed' });
        }

        lobby.started = true;
        await lobby.save();

        res.status(200).json({ success: true, message: 'Quiz started' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

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
            const reward = Math.floor(lobby.baseReward * Math.pow(1.1, player.streak - 1));
            player.score += reward;
        } else {
            player.streak = 0;
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
            .sort((a, b) => b.score - a.score);

        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:code/distribute-rewards', async (req, res) => {
    try {
        const { code } = req.params;

        const lobby = await Lobby.findOne({ code });

        if (!lobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        if (!lobby.withReward) {
            return res.status(400).json({ success: false, message: 'No reward distribution for this lobby' });
        }

        if (lobby.rewardDistributed) {
            return res.status(400).json({ success: false, message: 'Rewards already distributed' });
        }

        const commissionAmount = (lobby.rewardBalance * COMMISSION_PERCENT) / 100;
        const availableReward = lobby.rewardBalance - commissionAmount;

        const results = lobby.players
            .map(player => ({
                nickname: player.nickname,
                walletAddress: player.walletAddress,
                score: player.score
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // только топ-3 игрока

        const rewardDistribution = [];

        if (results[0]) rewardDistribution.push({
            nickname: results[0].nickname,
            walletAddress: results[0].walletAddress,
            reward: availableReward * 0.6
        });

        if (results[1]) rewardDistribution.push({
            nickname: results[1].nickname,
            walletAddress: results[1].walletAddress,
            reward: availableReward * 0.3
        });

        if (results[2]) rewardDistribution.push({
            nickname: results[2].nickname,
            walletAddress: results[2].walletAddress,
            reward: availableReward * 0.1
        });

        // 👉🏻 Тут будет реальная отправка TON в будущем
        console.log('Reward distribution:', rewardDistribution);

        lobby.rewardDistributed = true;
        await lobby.save();

        res.status(200).json({
            success: true,
            message: 'Rewards distributed successfully',
            rewardDistribution,
            commissionAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
