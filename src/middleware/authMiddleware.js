const jwt = require('jsonwebtoken');
const { User } = require('../models');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Отсутствует токен.' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: 'Пользователь не найден.' });
    req.user = { id: user.id, username: user.username, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Некорректный или истёкший токен.' });
  }
}

module.exports = authMiddleware;
