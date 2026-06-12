const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Student extends Model {}

Student.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'user_id',
    },
    admissionNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'admission_no',
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'course_id',
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'enrollment_date',
    },
    currentSemesterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'current_semester_id',
    },
  },
  {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
  }
);

module.exports = Student;
