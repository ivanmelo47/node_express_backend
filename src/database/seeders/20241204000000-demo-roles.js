'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'admin',
        description: 'Administrator with full access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'user',
        description: 'Standard user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
