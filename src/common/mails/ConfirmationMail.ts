import BaseHtml from './BaseHtml';

class ConfirmationMail {
  to: string;
  subject: string;
  user: any;
  token: string;

  constructor(user: any, token: string) {
    this.to = user.email;
    this.subject = 'Confirm your account';
    this.user = user;
    this.token = token;
  }

  get html() {
    // Use APP_URL from env or default to localhost:3000 for safety
    const listUrl = process.env.APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${listUrl}/confirm-account?token=${this.token}`;
    
    return BaseHtml({
        headerTitle: 'Welcome to BackendApp',
        contentTitle: `Hello, ${this.user.name}!`,
        bodyContent: `
            <p>Thank you for registering with us. We're excited to have you on board. To get started, please confirm your email address by clicking the button below.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
        `,
        actionUrl: confirmationUrl,
        actionText: 'Confirm Your Account'
    });
  }
}

export default ConfirmationMail;
