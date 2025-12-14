"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class Transporter {
    transporter;
    constructor() {
        const encryption = process.env.MAIL_ENCRYPTION;
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: encryption === 'ssl',
            requireTLS: encryption === 'tls',
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
        }
        catch (error) {
            console.error('Error sending email:', error);
            // We don't throw to avoid breaking the calling flow
        }
    }
}
exports.default = new Transporter();
