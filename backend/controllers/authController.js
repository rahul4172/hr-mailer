const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getAuthUrl, getTokensFromCode } = require('../config/googleOAuth');
const { google } = require('googleapis');
const db = require('../config/database');
const { encrypt } = require('../utils/crypto');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

/**
 * Initiate Google OAuth 2.0 Flow
 */
function googleLogin(req, res) {
  if (process.env.ENABLE_MOCK_AUTH === 'true') {
    return res.redirect('/auth/google/callback?code=mock_auth_code');
  }
  const url = getAuthUrl();
  res.redirect(url);
}

/**
 * Handle Google OAuth 2.0 Redirect Callback
 */
async function googleCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/?error=missing_auth_code');
    }

    let googleId, email, name, avatar, tokens;

    if (process.env.ENABLE_MOCK_AUTH === 'true' && code === 'mock_auth_code') {
      googleId = 'mock-google-id-12345';
      email = 'demo@lamborghini.com';
      name = 'Lamborghini Demo';
      avatar = 'https://ui-avatars.com/api/?name=Lambo+Demo&background=000000&color=FFC000';
      tokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expiry_date: Date.now() + 3600000
      };
    } else {
      tokens = await getTokensFromCode(code);
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: profile } = await oauth2.userinfo.get();

      googleId = profile.id;
      email = profile.email;
      name = profile.name || profile.email.split('@')[0];
      avatar = profile.picture;
    }

    const encryptedRefreshToken = encrypt(tokens.refresh_token);

    let user = await db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    let userId;

    if (user) {
      userId = user.id;
      await db.prepare(`
        UPDATE users 
        SET email = ?, name = ?, avatar = ?, access_token = ?, 
            refresh_token_encrypted = COALESCE(?, refresh_token_encrypted), 
            token_expiry = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(
        email,
        name,
        avatar,
        tokens.access_token,
        encryptedRefreshToken,
        tokens.expiry_date || null,
        userId
      );
    } else {
      userId = uuidv4();
      await db.prepare(`
        INSERT INTO users (id, google_id, email, name, avatar, access_token, refresh_token_encrypted, token_expiry)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        googleId,
        email,
        name,
        avatar,
        tokens.access_token,
        encryptedRefreshToken,
        tokens.expiry_date || null
      );

      // Create default settings
      await db.prepare(`
        INSERT INTO user_settings (id, user_id, min_delay_sec, max_delay_sec, max_retries, default_signature)
        VALUES (?, ?, 10, 25, 3, ?)
      `).run(uuidv4(), userId, `Best regards,\n${name}`);
    }

    // Generate JWT Token
    const jwtToken = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    // Set secure HTTP-only cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    if (req.session) {
      req.session.userId = userId;
    }

    logger.audit('USER_LOGIN', userId, req.ip, { email });

    res.redirect('/#dashboard');
  } catch (error) {
    logger.error('[OAuth Callback Error]', { error: error.message });
    res.redirect('/?error=oauth_failed');
  }
}

/**
 * Get current authenticated user profile
 */
async function getAuthStatus(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', authenticated: false });
    }

    const settings = await db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);

    res.json({
      status: 'success',
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar
      },
      settings: settings || {}
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Logout User
 */
function logout(req, res) {
  if (req.user) {
    logger.audit('USER_LOGOUT', req.user.id, req.ip);
  }
  res.clearCookie('token');
  if (req.session) {
    req.session.destroy();
  }
  res.json({ status: 'success', message: 'Logged out successfully' });
}

module.exports = {
  googleLogin,
  googleCallback,
  getAuthStatus,
  logout
};
