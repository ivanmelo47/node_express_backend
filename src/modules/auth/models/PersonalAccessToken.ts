import { DataTypes } from 'sequelize';
// @ts-ignore
import sequelize from '@/config/database';

const PersonalAccessToken = sequelize.define('PersonalAccessToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  abilities: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      // @ts-ignore
      const rawValue = this.getDataValue('abilities');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value: any) {
      // @ts-ignore
      this.setDataValue('abilities', JSON.stringify(value));
    }
  },
  last_used_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
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
PersonalAccessToken.prototype.can = function (ability: string): boolean {
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

export default PersonalAccessToken;
