const express = require('express');
const crypto = require('crypto');
const Lobby = require('../models/Lobby');
const Quiz = require('../models/Quiz');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ success: false, message: 'quizId is required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const code = crypto.randomBytes(3).toString('hex');

    const lobby = new Lobby({
      code,
      quiz: quiz._id,
      host: req.user.id,
      baseReward: 300 // фиксированное значение
    });

    await lobby.save();

    res.status(201).json({ success: true, code, lobbyId: lobby._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

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

module.exports = router;
