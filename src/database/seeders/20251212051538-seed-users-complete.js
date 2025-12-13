'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');

    // 1. Get Roles
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM users_roles;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});

    // 2. Get Abilities
    const abilities = await queryInterface.sequelize.query(
      `SELECT id, name FROM users_abilities;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const abilityMap = abilities.reduce((acc, ability) => {
      acc[ability.name] = ability.id;
      return acc;
    }, {});

    // 3. Define Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      {
        email: 'master@example.com',
        roleId: roleMap['master'],
        username: 'master.user',
        firstName: 'Master',
        lastNamePaternal: 'User',
        abilities: ['create', 'read', 'update', 'delete']
      },
      {
        email: 'admin@example.com',
        roleId: roleMap['admin'],
        username: 'admin.user',
        firstName: 'Admin',
        lastNamePaternal: 'User',
        abilities: ['create', 'read', 'update', 'delete']
      },
      {
        email: 'user@example.com',
        roleId: roleMap['user'],
        username: 'regular.user',
        firstName: 'Regular',
        lastNamePaternal: 'User',
        abilities: ['read']
      }
    ];

    for (const user of users) {
      // Check if user exists
      const existingUser = await queryInterface.rawSelect('users_users', {
        where: { email: user.email },
      }, ['id']);

      if (!existingUser) {
        // Create User
        // name column stores the username
        const userId = await queryInterface.bulkInsert('users_users', [{
          uuid: uuidv4(),
          name: user.username, 
          email: user.email,
          password: hashedPassword,
          roleId: user.roleId,
          confirmed: true,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);

        // Unfortunately bulkInsert returns ID slightly differently depending on dialect.
        // Let's fetch the user ID we just inserted or use rawSelect if we trust email uniqueness.
        const createdUserId = await queryInterface.rawSelect('users_users', {
          where: { email: user.email },
        }, ['id']);

        // Create Profile
        await queryInterface.bulkInsert('users_profiles', [{
          uuid: uuidv4(),
          userId: createdUserId,
          firstName: user.firstName,
          lastNamePaternal: user.lastNamePaternal,
          country: 'Mexico',
          createdAt: new Date(),
          updatedAt: new Date()
        }]);

        // Assign Abilities
        const userAbilities = user.abilities.map(name => ({
          userId: createdUserId,
          abilityId: abilityMap[name],
          createdAt: new Date(),
          updatedAt: new Date()
        })).filter(ua => ua.abilityId); // Filter out if ability not found

        if (userAbilities.length > 0) {
          await queryInterface.bulkInsert('users_user_abilities', userAbilities);
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const emails = ['master@example.com', 'admin@example.com', 'user@example.com'];
    
    // Get user IDs to delete profiles and abilities (though CASCADE might handle it)
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users_users WHERE email IN (:emails);`,
      { 
        replacements: { emails },
        type: queryInterface.sequelize.QueryTypes.SELECT 
      }
    );
    const userIds = users.map(u => u.id);

    if (userIds.length > 0) {
      await queryInterface.bulkDelete('users_user_abilities', { userId: userIds });
      await queryInterface.bulkDelete('users_profiles', { userId: userIds });
      await queryInterface.bulkDelete('users_users', { id: userIds }); // or by email
    }
  }
};
