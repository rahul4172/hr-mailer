const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict Rate Limiter for Auth and Sensitive Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Increased for testing
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  }
});

// CORS Options
const corsOptions = {
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

// CSRF Token Middleware
const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  const token = req.headers['x-csrf-token'] || (req.body && req.body._csrf);
  const sessionToken = req.session ? req.session.csrfToken : null;

  if (!sessionToken || !token || token !== sessionToken) {
    return res.status(403).json({ status: 'error', message: 'Invalid or missing CSRF token' });
  }
  next();
};

// Middleware to generate CSRF token
const generateCsrfToken = (req, res, next) => {
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  next();
};

function setupSecurity(app) {
  // Use Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable default CSP to allow custom inline styles & fonts
    crossOriginEmbedderPolicy: false
  }));

  // Enable CORS
  app.use(cors(corsOptions));

  // Apply Rate Limiting
  app.use('/api/', apiLimiter);
  app.use('/api/v1/auth/google', authLimiter);
  app.use('/api/v1/auth/logout', authLimiter);
}

module.exports = {
  setupSecurity,
  csrfProtection,
  generateCsrfToken
};
