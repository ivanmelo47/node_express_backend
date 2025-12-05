'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get Roles
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM Roles;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const adminRole = roles.find(r => r.name === 'admin');
    const userRole = roles.find(r => r.name === 'user');

    if (!adminRole || !userRole) {
      console.error('Roles not found. Please run roles seeder first.');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Standard User',
        email: 'user@example.com',
        password: hashedPassword,
        roleId: userRole.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
