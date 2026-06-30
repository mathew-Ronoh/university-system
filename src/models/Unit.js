// Unit model — a subject/course-unit within a degree program
// e.g., "CS101 Introduction to Programming" belongs to BSC-CS
// A unit is taught by a lecturer in a specific semester

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Unit extends Model {}

Unit.init(
  {
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,     // e.g., "CS101", "MATH201"
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,  // Full unit name
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,   // Credit hours — affects GPA calculation
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,   // Every unit belongs to a course/program
      field: 'course_id',
    },
    semesterId: {
      type: DataTypes.INTEGER,
      allowNull: true,    // Null until admin assigns it to a semester
      field: 'semester_id',
    },
    lecturerId: {
      type: DataTypes.INTEGER,
      allowNull: true,    // Null until admin assigns a lecturer to teach it
      field: 'lecturer_id',
    },
  },
  {
    sequelize,
    modelName: 'Unit',
    tableName: 'units',
  }
);

module.exports = Unit;
