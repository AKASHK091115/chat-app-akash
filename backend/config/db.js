const { Sequelize } = require('sequelize');
require('dotenv').config();
//added port and logging
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: 40813,
  logging: false
});

module.exports = sequelize;
