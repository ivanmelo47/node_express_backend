class ConfirmationMail {
  constructor(user, token) {
    this.to = user.email;
    this.subject = 'Confirm your account';
    this.user = user;
    this.token = token;
  }

  get html() {
    // In a real app, this URL would be from an env var like FRONTEND_URL
    const confirmationUrl = `http://localhost:3000/confirm-account?token=${this.token}`;
    const year = new Date().getFullYear();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #51545e; margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: none; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
          .header { background-color: #4f46e5; padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 40px 40px; line-height: 1.6; }
          .content h2 { color: #333333; margin-top: 0; font-size: 22px; }
          .content p { margin-bottom: 20px; font-size: 16px; color: #51545e; }
          .btn-container { text-align: center; margin: 35px 0; }
          .btn { background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
          .btn:hover { background-color: #4338ca; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .link-text { font-size: 12px; color: #999; margin-top: 20px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to BackendApp</h1>
          </div>
          <div class="content">
            <h2>Hello, ${this.user.name}!</h2>
            <p>Thank you for registering with us. We're excited to have you on board. To get started, please confirm your email address by clicking the button below.</p>
            
            <div class="btn-container">
              <a href="${confirmationUrl}" class="btn">Confirm Your Account</a>
            </div>

            <p>If you didn't create an account, you can safely ignore this email.</p>
            
            <div class="link-text">
              <p>Or paste this link into your browser: <br/> <a href="${confirmationUrl}" style="color: #4f46e5;">${confirmationUrl}</a></p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${year} BackendApp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = ConfirmationMail;
