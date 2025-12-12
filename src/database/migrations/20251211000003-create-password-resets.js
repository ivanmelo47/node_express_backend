'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auth_password_resets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: false // Logic often handles this as non-unique log, but usually it's one active token per email. Let's index it.
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('auth_password_resets', ['email']);
    await queryInterface.addIndex('auth_password_resets', ['token']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auth_password_resets');
  }
};
