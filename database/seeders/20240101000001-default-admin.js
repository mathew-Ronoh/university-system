const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPassword = await bcrypt.hash('Admin@123456', 12);

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@university.ac.ke',
        password: adminPassword,
        role: 'admin',
        first_name: 'System',
        last_name: 'Admin',
        phone: '+254700000000',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'admin@university.ac.ke' });
  },
};
