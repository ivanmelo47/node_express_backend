"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
const UserProfile = database_1.default.define('UserProfile', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    uuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users_users',
            key: 'id'
        }
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastNamePaternal: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastNameMaternal: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    dateOfBirth: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    gender: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    curp: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    rfc: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    phonePrimary: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phoneSecondary: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    emailAlternate: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    street: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    exteriorNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    interiorNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    neighborhood: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    zipCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'Mexico',
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    nationality: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'users_profiles',
    timestamps: true,
    paranoid: true, // Enable soft deletes (deletedAt)
});
exports.default = UserProfile;
