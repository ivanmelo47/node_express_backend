'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'roleId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true, // Allow null initially for existing users, or set a default if we could
    });

    // Optional: Remove the old 'role' column if you want to fully switch
    // await queryInterface.removeColumn('Users', 'role');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'roleId');
    // await queryInterface.addColumn('Users', 'role', { type: Sequelize.STRING });
  }
};
