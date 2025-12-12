import BaseHtml from './BaseHtml';

class ResetPasswordSuccessMail {
    to: string;
    subject: string;
    user: any;

    constructor(user: any) {
        this.to = user.email;
        this.subject = 'Password Changed Successfully';
        this.user = user;
    }

    get html() {
        const listUrl = process.env.APP_URL || 'http://localhost:3000';
        const loginUrl = `${listUrl}/login`;

        return BaseHtml({
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

export default ResetPasswordSuccessMail;
