require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { setupSecurity } = require('./config/security');
const errorHandler = require('./middleware/errorHandler');
const apiRouter = require('./routes/api');
const authController = require('./controllers/authController');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Express Session Configuration for OAuth state
app.use(session({
  secret: process.env.SESSION_SECRET || 'hr-mailer-pro-session-secret-778899',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Setup Security Headers, CORS, Rate Limits
setupSecurity(app);

// Direct OAuth 2.0 Route Aliases for Google Cloud Console Redirect URIs
app.get('/auth/google', authController.googleLogin);
app.get('/auth/google/callback', authController.googleCallback);

// Static uploads folder for access
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Router
app.use('/api/v1', apiRouter);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// SPA Fallback and API 404 handler
app.all('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ status: 'error', message: 'API Endpoint Not Found' });
  }
  if (req.method === 'GET') {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  return res.status(404).send('Not Found');
});

// Global Error Handler
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(PORT, () => {
  logger.info(`[HR Mailer Pro] Production Server running on http://localhost:${PORT}`);
  logger.info(`[Auth Mode] Mock Auth Enabled: ${process.env.ENABLE_MOCK_AUTH === 'true'}`);
  logger.info(`[Google OAuth] Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('[HR Mailer Pro] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('[HR Mailer Pro] Server closed.');
    process.exit(0);
  });
});

module.exports = app;
