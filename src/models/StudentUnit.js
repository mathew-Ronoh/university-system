// StudentUnit model — join table for many-to-many relationship between students and units
// A student can be enrolled in many units per semester
// A unit can have many students enrolled
// The unique index prevents duplicate enrollments

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class StudentUnit extends Model {}

StudentUnit.init(
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
  },
  {
    sequelize,
    modelName: 'StudentUnit',
    tableName: 'student_units',
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'unit_id', 'semester_id'], // One enrollment per student per unit per semester
      },
    ],
  }
);

module.exports = StudentUnit;
