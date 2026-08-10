/**
 * Base Email Provider Interface
 * Standard abstraction interface to support future provider additions
 * (Gmail, Outlook, SendGrid, Resend, Mailgun, SMTP) without changing application core.
 */
class BaseEmailProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Send single email method
   * @param {Object} options - { from, to, subject, body, attachments, authTokens }
   * @returns {Promise<Object>} { success: boolean, messageId?: string, error?: string }
   */
  async sendEmail(options) {
    throw new Error('sendEmail() method must be implemented by concrete subclass');
  }
}

module.exports = BaseEmailProvider;
