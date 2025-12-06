const { Sequelize } = require("sequelize");
const path = require("path");
const moment = require('moment-timezone');
require("dotenv").config();

const timezone = process.env.APP_TIMEZONE || 'UTC';
const offset = moment.tz(timezone).format('Z');

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    port: process.env.DB_PORT,
    logging: false,
    timezone: offset,
    dialectOptions: {
      timezone: offset
    }
  }
);

module.exports = sequelize;
