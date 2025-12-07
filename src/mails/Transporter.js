const nodemailer = require('nodemailer');

class Transporter {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    });
  }

  /**
   * Send an email using a Mailable object.
   * @param {Object} mailable - An object with { to, subject, html }.
   */
  async send(mailable) {
    const mailOptions = {
      from: '"No Reply" <noreply@example.com>',
      to: mailable.to,
      subject: mailable.subject,
      html: mailable.html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      // We don't throw to avoid breaking the calling flow
    }
  }
}

module.exports = new Transporter();
