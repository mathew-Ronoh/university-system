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
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    grade: {
      type: DataTypes.ENUM('A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'I'),
      allowNull: true,
    },
    enteredBy: {
      type: DataTypes.INTEGER,
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
        fields: ['student_id', 'unit_id', 'semester_id'],
      },
    ],
  }
);

module.exports = Result;
