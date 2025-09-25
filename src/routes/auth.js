const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { User, createUser } = require('../models');
const { sanitizeInputString } = require('../utils/sanitizer');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'AVEL4234CVJKB2345SVHN43SKN34N4N3KJN546PSDBNR59';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const username = sanitizeInputString(req.body.username || '');
    const password = (req.body.password || '').toString();

    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const username = sanitizeInputString(req.body.username || '');
    const password = (req.body.password || '').toString();

    if (!username || !password) return res.status(400).json({ error: 'Заполнены не все поля.' });

    if (username.length < 3 || password.length < 6) return res.status(400).json({ error: 'Имя пользователя или пароль слишком короткие.' });

    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(400).json({ error: 'Пользователь существует.' });

    const u = await createUser(username, password);
    res.status(201).json({ id: u.id, username: u.username });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Невозможно создать пользователя.' });
  }
});

module.exports = router;
