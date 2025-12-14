"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// @ts-ignore
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const timezone = process.env.APP_TIMEZONE || 'UTC';
const offset = moment_timezone_1.default.tz(timezone).format('Z');
const sequelize = new sequelize_1.Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, // Password can be undefined
{
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    port: Number(process.env.DB_PORT) || 3306,
    logging: false,
    timezone: offset,
    dialectOptions: {
        timezone: offset
    }
});
// -------------------------------------------------------------------------
// Métodos auxiliares para transacciones (estilo Laravel)
// -------------------------------------------------------------------------
/**
 * Inicia una nueva transacción de base de datos.
 * @returns {Promise<Transaction>} - Objeto de transacción de Sequelize.
 */
sequelize.init = async function () {
    return await this.transaction();
};
/**
 * Confirma (commit) una transacción activa.
 * @param {Transaction} t - La transacción a confirmar.
 * @returns {Promise<void>}
 */
sequelize.commit = async function (t) {
    if (t)
        await t.commit();
};
/**
 * Revierta (rollback) una transacción activa.
 * @param {Transaction} t - La transacción a revertir.
 * @returns {Promise<void>}
 */
sequelize.rollback = async function (t) {
    if (t)
        await t.rollback();
};
exports.default = sequelize;
