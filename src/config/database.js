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
    //dialect: 'mysql',
    dialect: 'mariadb', 
    port: process.env.DB_PORT,
    logging: false,
    timezone: offset,
    dialectOptions: {
      timezone: offset
    }
  }
);

// -------------------------------------------------------------------------
// Métodos auxiliares para transacciones (estilo Laravel)
// -------------------------------------------------------------------------

/**
 * Inicia una nueva transacción de base de datos.
 * @returns {Promise<Transaction>} - Objeto de transacción de Sequelize.
 */
sequelize.init = async function() {
  return await this.transaction();
};

/**
 * Confirma (commit) una transacción activa.
 * @param {Transaction} t - La transacción a confirmar.
 * @returns {Promise<void>}
 */
sequelize.commit = async function(t) {
  if (t) await t.commit();
};

/**
 * Revierta (rollback) una transacción activa.
 * @param {Transaction} t - La transacción a revertir.
 * @returns {Promise<void>}
 */
sequelize.rollback = async function(t) {
  if (t) await t.rollback();
};

module.exports = sequelize;
