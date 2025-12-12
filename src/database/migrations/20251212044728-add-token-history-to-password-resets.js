'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('auth_password_resets', 'tokenUsed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('auth_password_resets', 'usedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('auth_password_resets', 'tokenUsed');
    await queryInterface.removeColumn('auth_password_resets', 'usedAt');
  }
};
