require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { sequelize, User } = require('./models');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use('/auth', authRoutes);
app.use('/api/data', dataRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

async function start() {
  try {
    await sequelize.sync({ alter: true });
    const count = await User.count();
    if (count === 0) {
      const bcrypt = require('bcrypt');
      await User.create({ username: 'admin', passwordHash: await bcrypt.hash('adminpass', 12), role: 'admin' });
      await User.create({ username: 'user', passwordHash: await bcrypt.hash('userpass', 12), role: 'user' });
      console.log('Созданы стандартные пользователи.');
    }
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Не удалось запустить сервер.', err);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = app;
