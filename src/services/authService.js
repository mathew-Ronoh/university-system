// Authentication service — handles login, token generation, and token refresh
// Separated from the controller so business logic can be reused/tested independently

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const { User } = require('../models');

// Generate a short-lived access token (default: 30 minutes)
const generateToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Generate a long-lived refresh token (default: 7 days) — used to get new access tokens
const generateRefreshToken = (user) => {
  const payload = { id: user.id, type: 'refresh' };
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

// Main login flow: find user → check active → validate password → update lastLogin → return tokens
const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw { status: 401, message: 'Invalid email or password.' };
  }
  if (!user.isActive) {
    throw { status: 403, message: 'Account is deactivated. Contact admin.' };
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  // Track when the user last logged in
  await user.update({ lastLogin: new Date() });

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  };
};

// Exchange a valid refresh token for a new access token (no re-authentication needed)
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      throw { status: 401, message: 'Invalid refresh token.' };
    }
    const accessToken = generateToken(user);
    return { accessToken };
  } catch (error) {
    if (error.status) throw error;
    throw { status: 401, message: 'Invalid or expired refresh token.' };
  }
};

// Utility for future "forgot password" feature
const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  login,
  refreshAccessToken,
  generateToken,
  generateRefreshToken,
  generatePasswordResetToken,
};
