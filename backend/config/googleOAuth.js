const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'MOCK_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'MOCK_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.send'
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
}

function getAuthUrl(state = '') {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: state
  });
}

async function getTokensFromCode(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  getTokensFromCode,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
};
