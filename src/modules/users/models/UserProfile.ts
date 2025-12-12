import { DataTypes } from 'sequelize';
// @ts-ignore
import sequelize from '@/config/database';
import User from './User';

const UserProfile = sequelize.define('UserProfile', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users_users',
      key: 'id'
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastNamePaternal: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastNameMaternal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  curp: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  rfc: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  phonePrimary: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneSecondary: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailAlternate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  exteriorNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  interiorNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'Mexico',
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'users_profiles',
  timestamps: true,
  paranoid: true, // Enable soft deletes (deletedAt)
});

export default UserProfile;
