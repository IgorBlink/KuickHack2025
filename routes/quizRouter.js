const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const multer = require('multer');
const upload = multer();

router.post('/', async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Title and questions are required' });
    }

    for (const question of questions) {
      if (
        !question.questionText ||
        !Array.isArray(question.options) ||
        question.options.length === 0 ||
        !Array.isArray(question.correctAnswers) ||
        question.options.length !== question.correctAnswers.length
      ) {
        return res.status(400).json({ success: false, message: 'Each question must have valid format' });
      }

      const correctCount = question.correctAnswers.filter(Boolean).length;
      if (correctCount > 2) {
        return res.status(400).json({ success: false, message: 'No more than 2 correct answers allowed per question' });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      questions,
      createdBy: req.user.id
    });

    await quiz.save();
    res.status(201).json({ success: true, message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Генерация квиза по теме (на русском)
router.post('/ai', async (req, res) => {
  try {
    const { topic, quantity = 5 } = req.body;

    if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });
    if (quantity < 2) return res.status(400).json({ success: false, message: 'Quantity must be more than 1' });

    const safeQuantity = Math.min(Math.max(parseInt(quantity), 1), 20);
    const prompt = `Сгенерируй ${safeQuantity} вопросов с несколькими вариантами ответа на тему "${topic}". 
Ограничь количество правильных ответов максимум 2. Формат ответа — только строгий JSON без текста: [{"questionText": "...", "options": ["..."], "correctAnswers": [true, false, ...]}].`;

    const fetchResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await fetchResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return res.status(500).json({ success: false, message: 'Gemini API returned no text' });

    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/```([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText;

    let questions;
    try {
      questions = JSON.parse(jsonStr);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Unexpected token in JSON', raw: rawText });
    }

    for (const q of questions) {
      if (
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length === 0 ||
        !Array.isArray(q.correctAnswers) ||
        q.options.length !== q.correctAnswers.length ||
        q.correctAnswers.filter(Boolean).length > 2
      ) {
        return res.status(400).json({ success: false, message: 'Invalid question format or too many correct answers', question: q });
      }
    }

    const quiz = new Quiz({
      title: topic,
      description: `Автоматически сгенерирован на тему "${topic}"`,
      questions,
      createdBy: req.user?.id || null
    });

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Генерация квиза по изображению (на русском)
router.post('/ai/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const summaryPrompt = `Определи короткую тему (1-5 слов) на русском языке, которая описывает содержание изображения. Без объяснений, просто тема.`;

    const summaryFetch = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              { text: summaryPrompt }
            ]
          }]
        })
      }
    );

    const summaryData = await summaryFetch.json();
    const topicText = summaryData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const topic = topicText || 'Изображение';

    const prompt = `Сгенерируй 5 вопросов с несколькими вариантами ответа на основе этого изображения. Ответ на русском языке. Максимум 2 правильных варианта ответа на вопрос.
Формат ответа — строго JSON: [{"questionText": "...", "options": ["..."], "correctAnswers": [true, false, ...]}]. Без объяснений.`;

    const fetchResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              { text: prompt }
            ]
          }]
        })
      }
    );

    const data = await fetchResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.log('❌ No text from Gemini:', JSON.stringify(data, null, 2));
      return res.status(500).json({ success: false, message: 'Gemini Vision API returned no text' });
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
        !Array.isArray(q.correctAnswers) ||
        q.options.length !== q.correctAnswers.length
      ) {
        return res.status(400).json({ success: false, message: 'Invalid question format', question: q });
      }

      const trueCount = q.correctAnswers.filter(v => v === true).length;
      if (trueCount > 2) {
        let count = 0;
        q.correctAnswers = q.correctAnswers.map(v => {
          if (v === true && count < 2) {
            count++;
            return true;
          }
          return false;
        });
      }
    }

    const quiz = new Quiz({
      title: topic,
      description: `Сгенерировано по изображению`,
      questions,
      createdBy: req.user?.id || null
    });

    res.status(201).json({
      success: true,
      message: 'Quiz successfully generated from image',
      quiz
    });
  } catch (error) {
    console.error('❌ Error in /ai/image:', error);
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
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
