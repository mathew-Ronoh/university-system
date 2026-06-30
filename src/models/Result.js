// Result model — stores a student's marks and grade for a specific unit in a semester
// Each student can have at most ONE result per unit per semester (unique index)
// Grades follow the Kenyan university system: A, B+, B, C+, C, D+, D, E, F, I (Incomplete)

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Result extends Model {}

Result.init(
  {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'unit_id',
    },
    semesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'semester_id',
    },
    marks: {
      type: DataTypes.DECIMAL(5, 2),  // e.g., 85.50 out of 100
      allowNull: true,
    },
    grade: {
      type: DataTypes.ENUM('A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'I'),
      allowNull: true,
    },
    enteredBy: {
      type: DataTypes.INTEGER,        // FK to User — tracks which lecturer entered the grade
      allowNull: false,
      field: 'entered_by',
    },
  },
  {
    sequelize,
    modelName: 'Result',
    tableName: 'results',
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'unit_id', 'semester_id'], // One result per student per unit per semester
      },
    ],
  }
);

module.exports = Result;
