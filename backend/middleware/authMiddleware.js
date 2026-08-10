const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'hr-mailer-pro-jwt-secret-key-998877';

async function authMiddleware(req, res, next) {
  // Real OAuth / JWT verification

  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.session && req.session.userId) {
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid session or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired authentication token.' });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};
