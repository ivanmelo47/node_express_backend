'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Seed Roles
    const roles = [
      { name: 'master', description: 'Super Administrator', hierarchy: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'admin', description: 'Administrator', hierarchy: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'user', description: 'Regular User', hierarchy: 3, createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const role of roles) {
      const exists = await queryInterface.rawSelect('users_roles', {
        where: { name: role.name },
      }, ['id']);
      
      if (!exists) {
        await queryInterface.bulkInsert('users_roles', [role]);
      }
    }

    // 2. Seed Abilities
    const abilities = [
      { name: 'create', description: 'Can create content', createdAt: new Date(), updatedAt: new Date() },
      { name: 'read', description: 'Can view content', createdAt: new Date(), updatedAt: new Date() },
      { name: 'update', description: 'Can update content', createdAt: new Date(), updatedAt: new Date() },
      { name: 'delete', description: 'Can delete content', createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const ability of abilities) {
      const exists = await queryInterface.rawSelect('users_abilities', {
        where: { name: ability.name },
      }, ['id']);

      if (!exists) {
        await queryInterface.bulkInsert('users_abilities', [ability]);
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users_roles', { name: 'master' }, {});
    await queryInterface.bulkDelete('users_abilities', null, {});
  }
};
