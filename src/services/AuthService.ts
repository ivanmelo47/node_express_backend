import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import PersonalAccessToken from '@/models/PersonalAccessToken';
import User from '@/models/User';
import Role from '@/models/Role';
import Transporter from '@/mails/Transporter';
import ConfirmationMail from '@/mails/ConfirmationMail';

class AuthService {

  /**
   * Register a new user.
   * @param {Object} data - { name, email, password }
   * @returns {Object} - { user, confirmationToken }
   */
  static async register(data: any) {
    const { name, email, password } = data;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error: any = new Error('Email already in use');
        error.statusCode = 400; // Using statusCode property for cleaner controller handling if desired
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find default role
    const userRole = await Role.findOne({ where: { name: 'user' } });
    if (!userRole) {
         throw new Error('Default role not found');
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: userRole.id,
      confirmed: false,
      confirmationToken: confirmationToken,
      status: true
    });

    // Send confirmation email
    await Transporter.send(new ConfirmationMail(user, confirmationToken));

    return { user, confirmationToken };
  }

  /**
   * Login a user.
   * @param {string} email 
   * @param {string} password 
   * @returns {Object} - { user, token, roleName }
   */
  static async login(email: string, password: string) {
    // Find user with Role
    const user = await User.findOne({ 
      where: { email },
      include: ['Role']
    });
    
    if (!user) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check status and confirmation
    if (!user.status) {
        const error: any = new Error('Account is disabled. Please contact support.');
        error.statusCode = 403;
        throw error;
    }

    if (!user.confirmed) {
        const error: any = new Error('Please confirm your email address before logging in.');
        error.statusCode = 403;
        throw error;
    }

    // Define abilities based on role
    let abilities = ['user:read']; 
    const roleName = user.Role ? user.Role.name : 'user';

    if (roleName === 'admin') {
      abilities = ['*']; 
    } else if (roleName === 'user') {
      abilities = ['user:read', 'user:update'];
    }

    // Generate token
    const token = await AuthService.createToken(user, abilities);

    return { user, token, roleName };
  }

  /**
   * Confirm a user account.
   * @param {string} token 
   * @returns {Object} user
   */
  static async confirmAccount(token: string) {
    const user = await User.findOne({ where: { confirmationToken: token } });

    if (!user) {
        const error: any = new Error('Invalid or expired confirmation token');
        error.statusCode = 404; // Not Found
        throw error;
    }

    user.confirmed = true;
    user.confirmationToken = null; // Clear token after use
    await user.save();

    return user;
  }

  /**
   * Generate a new personal access token for a user.
   * @param {Object} user - The user instance.
   * @param {string} name - The name of the token (optional, not stored in DB currently but good for future).
   * @param {Array} abilities - List of abilities ['register', 'edit', 'delete'].
   * @returns {string} - The plain text token.
   */
  static async createToken(user: any, abilities: string[] = []) {
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
  static async validateToken(token: string) {
    const accessToken = await PersonalAccessToken.findOne({
      where: { token },
      include: [{
        // @ts-ignore
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

export default AuthService;
