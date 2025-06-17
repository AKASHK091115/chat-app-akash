const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlaintextPassword = sequelize.define('PlaintextPassword', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plaintext_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'plaintext_passwords',
  timestamps: false,
  underscored: true,
});

module.exports = PlaintextPassword;
