const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Unit extends Model {}

Unit.init(
  {
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'course_id',
    },
    semesterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'semester_id',
    },
    lecturerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
