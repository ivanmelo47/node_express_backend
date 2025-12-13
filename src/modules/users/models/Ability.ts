import { DataTypes } from 'sequelize';
// @ts-ignore
import sequelize from '@/config/database';

const Ability = sequelize.define('Ability', {
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
}, {
    tableName: 'users_abilities',
    timestamps: true,
});

export default Ability;
