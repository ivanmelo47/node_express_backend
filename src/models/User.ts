import { DataTypes } from 'sequelize';
// @ts-ignore
import sequelize from '@/config/database';
import Role from './Role';
import PersonalAccessToken from './PersonalAccessToken';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  timestamps: true,
  paranoid: true, // Enable soft deletes
});

// Define associations
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

User.hasMany(PersonalAccessToken, { foreignKey: 'userId' });
PersonalAccessToken.belongsTo(User, { foreignKey: 'userId' });

export default User;
