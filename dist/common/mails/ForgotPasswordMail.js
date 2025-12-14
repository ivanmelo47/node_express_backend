"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseHtml_1 = __importDefault(require("./BaseHtml"));
class ForgotPasswordMail {
    to;
    subject;
    user;
    token;
    constructor(user, token) {
        this.to = user.email;
        this.subject = 'Reset Your Password';
        this.user = user;
        this.token = token;
    }
    get html() {
        const listUrl = process.env.APP_URL || 'http://localhost:3000';
        // Invented URL as requested by the user
        const resetUrl = `${listUrl}/reset-password?token=${this.token}`;
        return (0, BaseHtml_1.default)({
            headerTitle: 'Password Reset Request',
            contentTitle: `Hello, ${this.user.name}`,
            bodyContent: `
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
        `,
            actionUrl: resetUrl,
            actionText: 'Reset Password'
        });
    }
}
exports.default = ForgotPasswordMail;
