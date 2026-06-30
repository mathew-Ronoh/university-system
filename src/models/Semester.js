// Semester model — an academic term with start/end dates
// Only one semester should be marked isCurrent = true at any time
// All units, enrollments, and fees are linked to a specific semester

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Semester extends Model {}

Semester.init(
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,     // e.g., "Semester 1", "Semester 2"
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,     // e.g., "2025/2026"
      field: 'academic_year',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date',
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_current',  // Only one semester can be current at a time
    },
  },
  {
    sequelize,
    modelName: 'Semester',
    tableName: 'semesters',
  }
);

module.exports = Semester;
