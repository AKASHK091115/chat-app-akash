// models/messageRead.js ✅ class-based
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // your sequelize instance

class MessageRead extends Model {}

MessageRead.init({
  messageId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  readAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'MessageRead',
  tableName: 'message_reads',
  timestamps: false,
});

module.exports = MessageRead;
