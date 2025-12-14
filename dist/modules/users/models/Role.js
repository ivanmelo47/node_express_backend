"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
const Role = database_1.default.define('Role', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    hierarchy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 99,
    },
}, {
    tableName: 'users_roles',
    timestamps: true,
});
exports.default = Role;
