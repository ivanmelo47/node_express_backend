"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseHtml_1 = __importDefault(require("./BaseHtml"));
class ResetPasswordSuccessMail {
    to;
    subject;
    user;
    constructor(user) {
        this.to = user.email;
        this.subject = 'Password Changed Successfully';
        this.user = user;
    }
    get html() {
        const listUrl = process.env.APP_URL || 'http://localhost:3000';
        const loginUrl = `${listUrl}/login`;
        return (0, BaseHtml_1.default)({
            headerTitle: 'Password Changed',
            contentTitle: `Hello, ${this.user.name}`,
            bodyContent: `
            <p>Your password has been successfully changed.</p>
            <p>If you did not perform this action, please contact support immediately.</p>
        `,
            actionUrl: loginUrl,
            actionText: 'Login to your account'
        });
    }
}
exports.default = ResetPasswordSuccessMail;
