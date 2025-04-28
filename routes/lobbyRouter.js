const express = require('express');
const crypto = require('crypto');
const Lobby = require('../models/Lobby');
const Quiz = require('../models/Quiz');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Комиссия сервиса (%)
const COMMISSION_PERCENT = 5;

// ➡️ Создать лобби
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { quizId, baseReward, withReward } = req.body;

    if (!quizId || !baseReward || typeof withReward !== 'boolean') {
      return res.status(400).json({ success: false, message: 'quizId, baseReward and withReward are required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const code = crypto.randomBytes(3).toString('hex');

    const lobby = new Lobby({
      code,
      quiz: quiz._id,
      host: req.user.id,
      baseReward,
      withReward,
      rewardBalance: 0,
      paid: !withReward
    });

    await lobby.save();

    res.status(201).json({ success: true, code, lobbyId: lobby._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ➡️ Получить инфу о лобби
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const lobby = await Lobby.findOne({ code }).populate('quiz');
    if (!lobby) return res.status(404).json({ success: false, message: 'Lobby not found' });

    res.status(200).json({ success: true, lobby });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ➡️ Распределение наград
router.post('/:code/distribute-rewards', authMiddleware, async (req, res) => {
    try {
      const { code } = req.params;
  
      const lobby = await Lobby.findOne({ code });
  
      if (!lobby) return res.status(404).json({ success: false, message: 'Lobby not found' });
      if (!lobby.withReward) return res.status(400).json({ success: false, message: 'No rewards for this lobby' });
      if (!lobby.paid) return res.status(400).json({ success: false, message: 'Reward payment not completed' });
      if (lobby.rewardDistributed) return res.status(400).json({ success: false, message: 'Rewards already distributed' });
      if (lobby.rewardBalance <= 0) return res.status(400).json({ success: false, message: 'No reward balance' });
  
      const players = lobby.players.sort((a, b) => b.score - a.score);
      if (players.length === 0) return res.status(400).json({ success: false, message: 'No players to reward' });
  
      const commissionAmount = (lobby.rewardBalance * COMMISSION_PERCENT) / 100;
      const availableReward = lobby.rewardBalance - commissionAmount;
  
      const results = players.slice(0, 3);
  
      const rewardDistribution = [];
  
      if (results[0]) rewardDistribution.push({
        nickname: results[0].nickname,
        walletAddress: results[0].walletAddress,
        reward: Math.floor(availableReward * 0.6)
      });
      if (results[1]) rewardDistribution.push({
        nickname: results[1].nickname,
        walletAddress: results[1].walletAddress,
        reward: Math.floor(availableReward * 0.3)
      });
      if (results[2]) rewardDistribution.push({
        nickname: results[2].nickname,
        walletAddress: results[2].walletAddress,
        reward: Math.floor(availableReward * 0.1)
      });
  
      // ❗ Здесь должно быть реальное распределение TON через blockchain API
      // TODO: Send real transactions to walletAddress
      console.log('Reward distribution:', rewardDistribution);
  
      lobby.rewardDistributed = true;
      await lobby.save();
  
      res.status(200).json({
        success: true,
        message: 'Rewards distributed successfully',
        rewardDistribution,
        commissionAmount
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
