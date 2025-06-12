const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Grouptab = sequelize.define('Grouptab', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdBy: {
  type: DataTypes.INTEGER,
  allowNull: false
}

});
 
module.exports = Grouptab;
