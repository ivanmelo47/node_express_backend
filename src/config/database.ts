import { Sequelize, Transaction } from "sequelize";
// @ts-ignore
import moment from 'moment-timezone';
import dotenv from 'dotenv';
dotenv.config();

const timezone = process.env.APP_TIMEZONE || 'UTC';
const offset = moment.tz(timezone).format('Z');

const sequelize: any = new Sequelize(
  process.env.DB_DATABASE as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD, // Password can be undefined
  {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    port: Number(process.env.DB_PORT) || 3306,
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
sequelize.init = async function(): Promise<Transaction> {
  return await this.transaction();
};

/**
 * Confirma (commit) una transacción activa.
 * @param {Transaction} t - La transacción a confirmar.
 * @returns {Promise<void>}
 */
sequelize.commit = async function(t: Transaction): Promise<void> {
  if (t) await t.commit();
};

/**
 * Revierta (rollback) una transacción activa.
 * @param {Transaction} t - La transacción a revertir.
 * @returns {Promise<void>}
 */
sequelize.rollback = async function(t: Transaction): Promise<void> {
  if (t) await t.rollback();
};

export default sequelize;
