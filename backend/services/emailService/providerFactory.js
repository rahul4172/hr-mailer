const GmailProvider = require('./gmailProvider');

class ProviderFactory {
  static getProvider(type = 'gmail') {
    switch (type.toLowerCase()) {
      case 'gmail':
      default:
        return new GmailProvider();
    }
  }
}

module.exports = ProviderFactory;
