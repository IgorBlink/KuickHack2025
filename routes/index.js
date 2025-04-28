const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');

const authRouter = require('./authRouter');
const quizRouter = require('./quizRouter');
const lobbyRouter = require('./lobbyRouter');

router.use('/auth', authRouter);
router.use('/lobby', lobbyRouter);
router.use('/quiz', authMiddleware, quizRouter);

module.exports = router;