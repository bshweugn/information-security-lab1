const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcrypt');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' }
}, {
  indexes: [{ fields: ['username'] }]
});

async function createUser(username, password, role = 'user') {
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  return User.create({ username, passwordHash: hash, role });
}

module.exports = { sequelize, User, createUser };
