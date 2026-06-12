const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Course extends Model {}

Course.init(
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
    department: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      comment: 'Semester tuition fee for this course',
    },
    lecturerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Course coordinator/head lecturer',
    },
  },
  {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
  }
);

module.exports = Course;
