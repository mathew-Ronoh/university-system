// Load environment variables from .env file into process.env
require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');
const config = require('./src/config');

const start = async () => {
  try {
    // Test database connection — throws if MySQL is unreachable
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // In development, auto-create tables via Sequelize sync
    // alter: false means it won't modify existing tables, only create missing ones
    // This avoids accidental data loss during development
    if (config.env === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database synced.');
    }

    // Start HTTP server on the configured port
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on port ${config.port} in ${config.env} mode.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
