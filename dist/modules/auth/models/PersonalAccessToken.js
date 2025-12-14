"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
const PersonalAccessToken = database_1.default.define('PersonalAccessToken', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    abilities: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        get() {
            // @ts-ignore
            const rawValue = this.getDataValue('abilities');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            // @ts-ignore
            this.setDataValue('abilities', JSON.stringify(value));
        }
    },
    last_used_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    expires_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
    tableName: 'auth_personal_access_tokens',
    timestamps: true,
});
/**
 * Check if the token has the given ability.
 * Supports wildcards (e.g., '*' or 'user:*').
 * @param {string} ability
 * @returns {boolean}
 */
PersonalAccessToken.prototype.can = function (ability) {
    const abilities = this.abilities || [];
    if (abilities.includes('*')) {
        return true;
    }
    if (abilities.includes(ability)) {
        return true;
    }
    // Check for resource wildcards (e.g., 'user:*' matches 'user:create')
    const resource = ability.split(':')[0];
    if (abilities.includes(`${resource}:*`)) {
        return true;
    }
    return false;
};
exports.default = PersonalAccessToken;
