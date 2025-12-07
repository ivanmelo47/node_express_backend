'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn('Users', 'confirmationToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'status', {
      type: Sequelize.BOOLEAN,
      defaultValue: true, // Default active
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'confirmed');
    await queryInterface.removeColumn('Users', 'confirmationToken');
    await queryInterface.removeColumn('Users', 'status');
  }
};
