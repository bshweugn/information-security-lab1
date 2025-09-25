const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sanitizeOutput } = require('../utils/sanitizer');
const { User } = require('../models');

// GET /api/data возвращает список пользователей
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'role'] });
    const safe = sanitizeOutput(users.map(u => u.get({ plain: true })));
    res.json({ data: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/data/post создаёт пост
const posts = [];
router.post('/post', authMiddleware, (req, res) => {
  try {
    const title = (req.body.title || '').toString();
    const body = (req.body.body || '').toString();

    if (title.length > 200 || body.length > 2000) return res.status(400).json({ error: 'Слишком длинный ввод' });

    const item = { id: posts.length + 1, author: req.user.username, title, body };
    posts.push(item);
    res.status(201).json({ post: sanitizeOutput(item) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
