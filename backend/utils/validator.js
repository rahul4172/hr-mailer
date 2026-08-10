const xss = require('xss');

/**
 * Standard RFC 5322 strict email regex check
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Sanitize strings against XSS attacks
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return xss(str.trim());
}

/**
 * Replace placeholders like {{company}}, {{name}}, {{email}} with recipient values.
 * Intelligent fallback handling:
 * e.g., if company is missing, fallback logic handles custom greetings.
 */
function interpolateVariables(template, variables = {}) {
  if (!template) return '';
  let result = template;

  const company = variables.company ? variables.company.trim() : '';
  const name = variables.name ? variables.name.trim() : '';
  const email = variables.email ? variables.email.trim() : '';

  // Smart greeting replacement helper if template includes greeting shortcuts
  if (/\{\{greeting\}\}/i.test(result)) {
    const greeting = company
      ? `Dear ${company} Recruitment Team,`
      : name
      ? `Dear ${name},`
      : `Dear Hiring Manager,`;
    result = result.replace(/\{\{greeting\}\}/gi, greeting);
  }

  // Standard replacements
  result = result.replace(/\{\{company\}\}/gi, company || 'Hiring Team');
  result = result.replace(/\{\{name\}\}/gi, name || 'Hiring Manager');
  result = result.replace(/\{\{email\}\}/gi, email || '');

  return result;
}

module.exports = {
  isValidEmail,
  sanitizeInput,
  interpolateVariables
};
