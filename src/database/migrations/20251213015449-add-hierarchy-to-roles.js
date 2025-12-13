'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users_roles', 'hierarchy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 99
    });

    // Update existing roles with correct hierarchy
    await queryInterface.bulkUpdate('users_roles', { hierarchy: 1 }, { name: 'master' });
    await queryInterface.bulkUpdate('users_roles', { hierarchy: 2 }, { name: 'admin' });
    await queryInterface.bulkUpdate('users_roles', { hierarchy: 3 }, { name: 'user' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users_roles', 'hierarchy');
  }
};
