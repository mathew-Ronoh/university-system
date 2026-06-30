// Database configuration for Sequelize CLI (migrations, seeders)
// Also consumed by src/config/database.js for runtime connection
// Three environments: development (your local machine), test (CI), production (live server)

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: false,  // Set to console.log to see raw SQL queries
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: `${process.env.DB_NAME || 'university_db'}_test`,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: false,
    // Connection pool for production — handles multiple concurrent requests efficiently
    pool: {
      max: 10,      // Maximum connections in the pool
      min: 2,       // Minimum connections kept alive
      acquire: 30000, // Max time (ms) to wait for a connection
      idle: 10000,    // Max time (ms) a connection can be idle before release
    },
  },
};
