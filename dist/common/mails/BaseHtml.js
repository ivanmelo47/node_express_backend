"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseHtml = ({ headerTitle, contentTitle, bodyContent, actionUrl, actionText }) => {
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
            <h1>${headerTitle}</h1>
          </div>
          <div class="content">
            <h2>${contentTitle}</h2>
            
            ${bodyContent}
            
            ${actionUrl && actionText ? `
            <div class="btn-container">
              <a href="${actionUrl}" class="btn">${actionText}</a>
            </div>
            ` : ''}

            ${actionUrl ? `
            <div class="link-text">
              <p>Or paste this link into your browser: <br/> <a href="${actionUrl}" style="color: #4f46e5;">${actionUrl}</a></p>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>&copy; ${year} BackendApp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
};
exports.default = BaseHtml;
