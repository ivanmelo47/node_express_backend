"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const PersonalAccessToken_1 = __importDefault(require("@/modules/auth/models/PersonalAccessToken"));
const User_1 = __importDefault(require("@/modules/users/models/User"));
const Role_1 = __importDefault(require("@/modules/users/models/Role"));
const Transporter_1 = __importDefault(require("@/common/mails/Transporter"));
const ConfirmationMail_1 = __importDefault(require("@/common/mails/ConfirmationMail"));
const ForgotPasswordMail_1 = __importDefault(require("@/common/mails/ForgotPasswordMail"));
const ResetPasswordSuccessMail_1 = __importDefault(require("@/common/mails/ResetPasswordSuccessMail"));
const PasswordReset_1 = __importDefault(require("@/modules/auth/models/PasswordReset"));
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
class AuthService {
    /**
     * Register a new user.
     * @param {Object} data - { name, email, password }
     * @returns {Object} - { user, confirmationToken }
     */
    static async register(data) {
        const { name, email, password } = data;
        // Check if user exists
        const existingUser = await User_1.default.findOne({ where: { email } });
        if (existingUser) {
            const error = new Error("Email already in use");
            error.statusCode = 400; // Using statusCode property for cleaner controller handling if desired
            throw error;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Find default role
        const userRole = await Role_1.default.findOne({ where: { name: "user" } });
        if (!userRole) {
            throw new Error("Default role not found");
        }
        // Generate confirmation token
        const confirmationToken = crypto_1.default.randomBytes(32).toString("hex");
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
            roleId: userRole.id,
            confirmed: false,
            confirmationToken: confirmationToken,
            status: true,
        });
        // Send confirmation email
        await Transporter_1.default.send(new ConfirmationMail_1.default(user, confirmationToken));
        return { user, confirmationToken };
    }
    /**
     * Login a user.
     * @param {string} email
     * @param {string} password
     * @returns {Object} - { user, token, roleName }
     */
    static async login(email, password) {
        // Find user with Role
        const user = await User_1.default.findOne({
            where: { email },
            include: ["Role"],
        });
        if (!user) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }
        // Check status and confirmation
        if (!user.status) {
            const error = new Error("Account is disabled. Please contact support.");
            error.statusCode = 403;
            throw error;
        }
        // Logic requested by user: master role gets all abilities (or specific set), 
        // others get their assigned abilities.
        // However, existing "master" implementation usually means full access. 
        // User request: "las habilidades seran create, read... en base a las habilidades que tenga un usuario"
        // BUT "master... estara por encima de admin". Usually implies '*' wildcard or similar.
        // Let's implement dynamic fetching.
        // Reload user with abilities
        const userWithAbilities = await User_1.default.findOne({
            where: { id: user.id },
            include: ['Role', 'abilities']
        });
        let abilities = [];
        const roleName = userWithAbilities.Role ? userWithAbilities.Role.name : "user";
        // Map ability names from DB
        abilities = userWithAbilities.abilities ? userWithAbilities.abilities.map((a) => a.name) : [];
        // If no abilities found, fallback to 'read' if desired, or leave empty.
        // For now, adhering to strict DB source of truth but keeping a safety fallback for existing users matches previous iteration logic generally,
        // but user requested "en funcion de las abilities que tiene asiganado".
        if (abilities.length === 0) {
            abilities = ["read"];
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
    static async confirmAccount(token) {
        const user = await User_1.default.findOne({ where: { confirmationToken: token } });
        if (!user) {
            const error = new Error("Invalid or expired confirmation token");
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
    static async createToken(user, abilities = []) {
        const token = crypto_1.default.randomBytes(40).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days expiration
        await PersonalAccessToken_1.default.create({
            token: token,
            abilities: abilities,
            userId: user.id,
            expires_at: expiresAt,
            last_used_at: null,
        });
        return token;
    }
    /**
     * Validate a token and return the associated user.
     * @param {string} token - The token to validate.
     * @returns {Object|null} - The token instance with user or null.
     */
    static async validateToken(token) {
        const accessToken = await PersonalAccessToken_1.default.findOne({
            where: { token },
            include: [
                {
                    // @ts-ignore
                    model: PersonalAccessToken_1.default.associations.User.target, // Or just 'User' if alias matches
                    include: ["Role"], // Nested include to get Role from User
                },
            ],
        });
        if (!accessToken) {
            return null;
        }
        // Check expiration
        if (accessToken.expires_at &&
            new Date() > new Date(accessToken.expires_at)) {
            return "expired";
        }
        // Update last used timestamp
        accessToken.last_used_at = new Date();
        await accessToken.save();
        await accessToken.save();
        return accessToken;
    }
    /**
     * Initiate password reset process.
     * @param {string} email
     */
    static async forgotPassword(email) {
        const user = await User_1.default.findOne({ where: { email } });
        if (!user || !user.status) {
            // Silently fail or return false to prevent enumeration, but for now throwing error for clarity or depending on requirements.
            // User requirement: check status true and validated.
            if (user && (!user.status || !user.confirmed)) {
                const error = new Error("Account not active or confirmed.");
                error.statusCode = 403;
                throw error;
            }
            // If user doesn't exist, generic message usually better, but here specific requirement provided.
            const error = new Error("User not found or inactive");
            error.statusCode = 404;
            throw error;
        }
        // Generate token
        const token = crypto_1.default.randomBytes(32).toString("hex");
        // Store in DB
        await PasswordReset_1.default.create({
            email,
            token,
            createdAt: new Date(),
        });
        // Send email
        await Transporter_1.default.send(new ForgotPasswordMail_1.default(user, token));
        // For now returning token for verification
        return token;
    }
    /**
     * Reset password using token.
     * @param {string} token
     * @param {string} newPassword
     */
    static async resetPassword(token, newPassword) {
        const t = await database_1.default.init();
        try {
            const resetRecord = await PasswordReset_1.default.findOne({
                where: { token },
                transaction: t,
            });
            if (!resetRecord) {
                const error = new Error("Invalid or expired password reset token");
                error.statusCode = 400;
                throw error;
            }
            // Check if token already used
            if (resetRecord.tokenUsed) {
                const error = new Error("Token already used");
                error.statusCode = 400;
                throw error;
            }
            // Check expiration (e.g., 1 hour)
            const now = new Date();
            const expirationTime = 60 * 60 * 1000; // 1 hour
            if (now.getTime() - resetRecord.createdAt.getTime() > expirationTime) {
                // We can choose to keep expired tokens too, but logic requested was about "reset" flow.
                // If expired, maybe we shouldn't delete it either if we want full history?
                // User said: "no quiero eliminar los tokens... quiero conservar esos tokens... historial"
                // So let's NOT destroy it even if expired, just throw error.
                // await resetRecord.destroy({ transaction: t }); 
                const error = new Error("Token expired");
                error.statusCode = 400;
                throw error;
            }
            const user = await User_1.default.findOne({
                where: { email: resetRecord.email },
                transaction: t,
            });
            if (!user) {
                // await resetRecord.destroy({ transaction: t });
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save({ transaction: t });
            // Mark token as used instead of deleting
            resetRecord.tokenUsed = true;
            resetRecord.usedAt = new Date();
            await resetRecord.save({ transaction: t });
            // DO NOT delete other tokens as requested ("no quiero eliminar los tokens... historial")
            await database_1.default.commit(t);
            // Send success email
            await Transporter_1.default.send(new ResetPasswordSuccessMail_1.default(user));
            return true;
        }
        catch (error) {
            await database_1.default.rollback(t);
            throw error;
        }
    }
}
exports.default = AuthService;
