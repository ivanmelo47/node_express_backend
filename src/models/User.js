const { DataTypes } = require('sequelize');
const sequelize = require('@/config/database');
const Role = require('./Role');
const PersonalAccessToken = require('./PersonalAccessToken');

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

module.exports = User;
