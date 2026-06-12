module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('courses', [
      { code: 'BSC-CS', name: 'Bachelor of Computer Science', credits: 120, department: 'Computing & Informatics', fee: 85000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BSC-IT', name: 'Bachelor of Information Technology', credits: 120, department: 'Computing & Informatics', fee: 75000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BBA', name: 'Bachelor of Business Administration', credits: 120, department: 'Business & Management', fee: 65000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BEC', name: 'Bachelor of Economics', credits: 120, department: 'Economics & Finance', fee: 60000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BED', name: 'Bachelor of Education (Arts)', credits: 128, department: 'Education', fee: 55000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BSC-ENG', name: 'Bachelor of Engineering (Civil)', credits: 144, department: 'Engineering & Technology', fee: 95000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BSC-EE', name: 'Bachelor of Electrical Engineering', credits: 144, department: 'Engineering & Technology', fee: 95000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'LLB', name: 'Bachelor of Laws', credits: 120, department: 'School of Law', fee: 110000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'MBChB', name: 'Bachelor of Medicine & Surgery', credits: 240, department: 'Medical Sciences', fee: 180000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BSC-NUR', name: 'Bachelor of Nursing', credits: 144, department: 'Medical Sciences', fee: 85000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BSC-ARC', name: 'Bachelor of Architecture', credits: 144, department: 'Built Environment', fee: 100000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BA-JMC', name: 'Bachelor of Journalism & Mass Communication', credits: 120, department: 'Media & Communication', fee: 65000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BSC-ACC', name: 'Bachelor of Accounting & Finance', credits: 120, department: 'Business & Management', fee: 70000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BSC-AGRI', name: 'Bachelor of Agriculture', credits: 136, department: 'Agricultural Sciences', fee: 60000.00, created_at: new Date(), updated_at: new Date() },
      { code: 'BPSY', name: 'Bachelor of Psychology', credits: 120, department: 'Social Sciences', fee: 58000.00, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('courses', null, {});
  },
};
