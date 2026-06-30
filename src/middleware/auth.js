// Authentication middleware — verifies JWT tokens and attaches the user to the request
// Two variants:
//   - authenticate: REQUIRES a valid token → returns 401 if missing/invalid
//   - optionalAuth: uses token if present, silently continues if not (for M-Pesa callbacks)

const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    // Support token in query string (for PDF downloads via browser) or Authorization header
    let token = req.query.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify the token's signature and extract payload { id, email, role }
    const decoded = jwt.verify(token, config.jwt.secret);

    // Fetch the user from DB to ensure they still exist and are active
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or account deactivated.' });
    }

    // Attach user data to request so downstream handlers can access it
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
      }
    }
  } catch {
    // Silently swallow errors — token is optional, so invalid/missing is fine
  }
  next();
};

module.exports = { authenticate, optionalAuth };
