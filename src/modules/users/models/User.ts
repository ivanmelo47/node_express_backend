import { DataTypes } from 'sequelize';
// @ts-ignore
import sequelize from '@/config/database';
import Role from './Role';
import PersonalAccessToken from '@/modules/auth/models/PersonalAccessToken';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  confirmationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // role: { ... } // Removed in favor of roleId association
}, {
  tableName: 'users_users',
  timestamps: true,
  paranoid: true, // Enable soft deletes
});

// Define associations
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

User.hasMany(PersonalAccessToken, { foreignKey: 'userId' });
PersonalAccessToken.belongsTo(User, { foreignKey: 'userId' });

import UserProfile from './UserProfile';
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

import Ability from './Ability';
User.belongsToMany(Ability, {
  through: 'users_user_abilities',
  foreignKey: 'userId',
  otherKey: 'abilityId',
  as: 'abilities'
});
Ability.belongsToMany(User, {
  through: 'users_user_abilities',
  foreignKey: 'abilityId',
  otherKey: 'userId',
  as: 'users'
});

export default User;
