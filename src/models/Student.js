// Student model — extends User with academic-specific fields
// Each student has a unique admission number, belongs to one course,
// and tracks which semester they're currently in

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Student extends Model {}

Student.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,           // One-to-one: each User can have at most one Student profile
      field: 'user_id',
    },
    admissionNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,           // Every student gets a unique admission number
      field: 'admission_no',
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,       // Student must belong to a course/program
      field: 'course_id',
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'enrollment_date',
    },
    currentSemesterId: {
      type: DataTypes.INTEGER,
      allowNull: true,        // Null until admin creates a semester and assigns it
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
