const User = require('@/models/User');
const Role = require('@/models/Role');

class UserService {
  /**
   * Create a new user.
   * @param {Object} data - User data (name, email, roleId, etc.).
   * @returns {Promise<User>}
   */
  static async createUser(data) {
    // If role name is provided instead of ID, resolve it (optional helper logic)
    // For now assuming controller passes valid data structure matching model
    return await User.create(data);
  }

  /**
   * Get all users.
   * @returns {Promise<Array<User>>}
   */
  static async getAllUsers() {
    return await User.findAll({
      include: ['Role'] // Include role info by default
    });
  }

  /**
   * Get a user by ID.
   * @param {number} id
   * @returns {Promise<User|null>}
   */
  static async getUserById(id) {
    return await User.findByPk(id, {
      include: ['Role']
    });
  }

  /**
   * Update a user.
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<User|null>} - Updated user or null if not found
   */
  static async updateUser(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(data);
    return user;
  }

  /**
   * Delete a user.
   * @param {number} id
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  static async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) return false;

    await user.destroy();
    return true;
  }
}

module.exports = UserService;
