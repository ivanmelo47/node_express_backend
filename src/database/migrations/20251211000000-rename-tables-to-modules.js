'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('Roles', 'users_roles');
    await queryInterface.renameTable('Users', 'users_users');
    await queryInterface.renameTable('PersonalAccessTokens', 'auth_personal_access_tokens');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('auth_personal_access_tokens', 'PersonalAccessTokens');
    await queryInterface.renameTable('users_users', 'Users');
    await queryInterface.renameTable('users_roles', 'Roles');
  }
};
