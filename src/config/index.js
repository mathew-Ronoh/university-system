// Centralized configuration — reads .env once and exports a structured config object
// All other modules import this instead of reading process.env directly
// This makes the code cleaner and gives a single source of truth for config values

require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    passkey: process.env.MPESA_PASSKEY,
    shortCode: process.env.MPESA_SHORTCODE,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    env: process.env.MPESA_ENV || 'sandbox',
  },

  helb: {
    apiKey: process.env.HELB_API_KEY,
    apiUrl: process.env.HELB_API_URL,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@university.ac.ke',
  },
};

module.exports = config;
