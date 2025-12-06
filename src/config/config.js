require('dotenv').config();
const moment = require('moment-timezone');
const timezone = process.env.APP_TIMEZONE || 'UTC';
const offset = moment.tz(timezone).format('Z');

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mariadb',
    logging: false,
    timezone: offset,
    dialectOptions: {
      timezone: offset
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mariadb',
    logging: false,
    timezone: offset,
    dialectOptions: {
      timezone: offset
    }
  }
};
