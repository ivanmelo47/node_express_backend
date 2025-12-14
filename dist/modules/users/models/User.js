"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
const Role_1 = __importDefault(require("./Role"));
const PersonalAccessToken_1 = __importDefault(require("@/modules/auth/models/PersonalAccessToken"));
const User = database_1.default.define('User', {
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
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    confirmed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    confirmationToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // role: { ... } // Removed in favor of roleId association
}, {
    tableName: 'users_users',
    timestamps: true,
    paranoid: true, // Enable soft deletes
});
// Define associations
User.belongsTo(Role_1.default, { foreignKey: 'roleId' });
Role_1.default.hasMany(User, { foreignKey: 'roleId' });
User.hasMany(PersonalAccessToken_1.default, { foreignKey: 'userId' });
PersonalAccessToken_1.default.belongsTo(User, { foreignKey: 'userId' });
const UserProfile_1 = __importDefault(require("./UserProfile"));
User.hasOne(UserProfile_1.default, { foreignKey: 'userId', as: 'profile' });
UserProfile_1.default.belongsTo(User, { foreignKey: 'userId', as: 'user' });
const Ability_1 = __importDefault(require("./Ability"));
User.belongsToMany(Ability_1.default, {
    through: 'users_user_abilities',
    foreignKey: 'userId',
    otherKey: 'abilityId',
    as: 'abilities'
});
Ability_1.default.belongsToMany(User, {
    through: 'users_user_abilities',
    foreignKey: 'abilityId',
    otherKey: 'userId',
    as: 'users'
});
exports.default = User;
