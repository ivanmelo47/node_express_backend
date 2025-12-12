import BaseHtml from './BaseHtml';

class ForgotPasswordMail {
    to: string;
    subject: string;
    user: any;
    token: string;

    constructor(user: any, token: string) {
        this.to = user.email;
        this.subject = 'Reset Your Password';
        this.user = user;
        this.token = token;
    }

    get html() {
        const listUrl = process.env.APP_URL || 'http://localhost:3000';
        // Invented URL as requested by the user
        const resetUrl = `${listUrl}/reset-password?token=${this.token}`;

        return BaseHtml({
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

export default ForgotPasswordMail;
