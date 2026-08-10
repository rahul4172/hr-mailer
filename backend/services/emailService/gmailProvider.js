const { google } = require('googleapis');
const BaseEmailProvider = require('./baseProvider');
const { getOAuth2Client } = require('../../config/googleOAuth');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

class GmailProvider extends BaseEmailProvider {
  constructor() {
    super('GmailAPI');
  }

  /**
   * Helper to construct RFC 2822 compliant MIME email message
   */
  createMimeMessage({ from, to, subject, html, attachments = [] }) {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    let message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      html,
      ''
    ];

    // Append attachments if present
    for (const file of attachments) {
      if (fs.existsSync(file.file_path)) {
        const fileData = fs.readFileSync(file.file_path);
        const base64Content = fileData.toString('base64');

        message.push(
          `--${boundary}`,
          `Content-Type: ${file.mime_type || 'application/octet-stream'}; name="${file.original_name}"`,
          `Content-Disposition: attachment; filename="${file.original_name}"`,
          'Content-Transfer-Encoding: base64',
          '',
          base64Content,
          ''
        );
      }
    }

    message.push(`--${boundary}--`);
    const rawMessage = message.join('\r\n');

    // Return URL-safe base64 string
    return Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Send single email via Google Gmail API
   */
  async sendEmail({ from, to, subject, body, attachments = [], authTokens }) {
    // If Mock Auth / Demo Mode enabled
    if (process.env.ENABLE_MOCK_AUTH === 'true' || authTokens?.accessToken === 'mock-access-token') {
      logger.info(`[Gmail API Mock] Sending email to ${to}`);
      // Simulate slight network transmission delay
      await new Promise(res => setTimeout(res, 800));
      return {
        success: true,
        messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      };
    }

    try {
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: authTokens.accessToken,
        refresh_token: authTokens.refreshToken
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const raw = this.createMimeMessage({
        from: from,
        to: to,
        subject: subject,
        html: body,
        attachments: attachments
      });

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: raw
        }
      });

      return {
        success: true,
        messageId: res.data.id
      };
    } catch (error) {
      logger.error(`[Gmail Provider Error] Failed to send email to ${to}:`, { error: error.message });
      return {
        success: false,
        error: error.message || 'Failed to send email via Gmail API'
      };
    }
  }
}

module.exports = GmailProvider;
