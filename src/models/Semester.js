const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Semester extends Model {}

Semester.init(
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
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
      field: 'is_current',
    },
  },
  {
    sequelize,
    modelName: 'Semester',
    tableName: 'semesters',
  }
);

module.exports = Semester;
