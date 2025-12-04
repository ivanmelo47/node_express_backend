const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    port: process.env.DB_PORT,
    logging: false,
  }
);

module.exports = sequelize;
