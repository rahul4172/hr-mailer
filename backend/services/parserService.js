const { isValidEmail } = require('../utils/validator');

/**
 * Parse raw email textarea input
 */
function parseEmailList(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      total: 0,
      valid: 0,
      invalid: 0,
      duplicates: 0,
      recipients: [],
      invalidItems: []
    };
  }

  // Split by line breaks, commas, or semicolons
  const lines = rawText.split(/[\r\n,;]+/);
  
  const seenEmails = new Set();
  const recipients = [];
  const invalidItems = [];

  let totalCount = 0;
  let duplicateCount = 0;

  for (let rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    totalCount++;

    let email = '';
    let name = '';
    let company = '';

    // Handle "Name <email@domain.com>" format
    const angleMatch = trimmed.match(/^(.*?)\s*<([^\s>]+)>$/);
    // Handle "Company: email@domain.com" or "Company - email@domain.com"
    const colonMatch = trimmed.match(/^([^:-]+)[:\-]\s*([^\s]+)$/);

    if (angleMatch) {
      name = angleMatch[1].trim();
      email = angleMatch[2].trim().toLowerCase();
    } else if (colonMatch && isValidEmail(colonMatch[2].trim())) {
      company = colonMatch[1].trim();
      email = colonMatch[2].trim().toLowerCase();
    } else {
      // Direct email string or clean extract
      const emailExtractMatch = trimmed.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
      if (emailExtractMatch) {
        email = emailExtractMatch[0].toLowerCase();
      } else {
        email = trimmed.toLowerCase();
      }
    }

    // Try to infer company from domain if company is missing (e.g. google.com -> Google)
    if (email && !company) {
      const parts = email.split('@');
      if (parts.length === 2) {
        const domainParts = parts[1].split('.');
        if (domainParts.length >= 2) {
          const domainName = domainParts[domainParts.length - 2];
          // Exclude generic providers like gmail, yahoo, hotmail, outlook
          const genericProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'proton', 'protonmail', 'live', 'aol'];
          if (!genericProviders.includes(domainName.toLowerCase())) {
            company = domainName.charAt(0).toUpperCase() + domainName.slice(1);
          }
        }
      }
    }

    if (isValidEmail(email)) {
      if (seenEmails.has(email)) {
        duplicateCount++;
      } else {
        seenEmails.add(email);
        recipients.push({
          email,
          name,
          company
        });
      }
    } else {
      invalidItems.push(trimmed);
    }
  }

  return {
    total: totalCount,
    valid: recipients.length,
    invalid: invalidItems.length,
    duplicates: duplicateCount,
    recipients,
    invalidItems
  };
}

module.exports = {
  parseEmailList
};
