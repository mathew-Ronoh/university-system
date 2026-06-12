require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');
const config = require('./src/config');

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    if (config.env === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database synced.');
    }

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.env} mode.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
