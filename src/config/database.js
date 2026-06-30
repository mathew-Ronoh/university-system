// Creates and configures the Sequelize ORM instance
// This single instance is shared across all models via require()

const { Sequelize } = require('sequelize');
const dbConfig = require('../../database/config');

// Pick the right database config based on current environment
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    define: {
      timestamps: true,    // Auto-add createdAt/updatedAt to every table
      underscored: true,   // Use snake_case in DB (e.g., created_at) but camelCase in JS
    },
  }
);

module.exports = sequelize;
