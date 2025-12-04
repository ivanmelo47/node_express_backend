const crypto = require('crypto');
const PersonalAccessToken = require('@/models/PersonalAccessToken');

class AuthService {
  /**
   * Generate a new personal access token for a user.
   * @param {Object} user - The user instance.
   * @param {string} name - The name of the token (optional, not stored in DB currently but good for future).
   * @param {Array} abilities - List of abilities ['register', 'edit', 'delete'].
   * @returns {string} - The plain text token.
   */
  static async createToken(user, abilities = []) {
    const token = crypto.randomBytes(40).toString('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days expiration

    await PersonalAccessToken.create({
      token: token,
      abilities: abilities,
      userId: user.id,
      expires_at: expiresAt,
      last_used_at: null
    });

    return token;
  }

  /**
   * Validate a token and return the associated user.
   * @param {string} token - The token to validate.
   * @returns {Object|null} - The token instance with user or null.
   */
  static async validateToken(token) {
    const accessToken = await PersonalAccessToken.findOne({
      where: { token },
      include: [{
        model: PersonalAccessToken.associations.User.target, // Or just 'User' if alias matches
        include: ['Role'] // Nested include to get Role from User
      }]
    });

    if (!accessToken) {
      return null;
    }

    // Check expiration
    if (accessToken.expires_at && new Date() > new Date(accessToken.expires_at)) {
      return 'expired';
    }

    // Update last used timestamp
    accessToken.last_used_at = new Date();
    await accessToken.save();

    return accessToken;
  }
}

module.exports = AuthService;
