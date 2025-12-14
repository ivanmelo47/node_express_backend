"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
const PasswordReset = database_1.default.define("PasswordReset", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    tokenUsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    usedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "auth_password_resets",
    timestamps: false,
});
exports.default = PasswordReset;
