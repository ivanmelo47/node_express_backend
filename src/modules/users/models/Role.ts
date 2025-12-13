import { DataTypes } from 'sequelize';
// @ts-ignore
import sequelize from '@/config/database';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hierarchy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 99,
  },
}, {
  tableName: 'users_roles',
  timestamps: true,
});

export default Role;
