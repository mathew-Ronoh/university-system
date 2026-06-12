const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Semester = require('./Semester');
const Unit = require('./Unit');
const Result = require('./Result');
const Fee = require('./Fee');
const Payment = require('./Payment');
const Invoice = require('./Invoice');
const Receipt = require('./Receipt');
const HelbLoan = require('./HelbLoan');
const AuditLog = require('./AuditLog');
const StudentUnit = require('./StudentUnit');
const Salary = require('./Salary');

const models = {
  User,
  Student,
  Course,
  Semester,
  Unit,
  Result,
  Fee,
  Payment,
  Invoice,
  Receipt,
  HelbLoan,
  AuditLog,
  StudentUnit,
  Salary,
};

User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Student.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Course.hasMany(Student, { foreignKey: 'courseId', as: 'students' });

Student.belongsTo(Semester, { foreignKey: 'currentSemesterId', as: 'currentSemester' });

Course.hasMany(Unit, { foreignKey: 'courseId', as: 'units' });
Unit.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Course.belongsTo(User, { foreignKey: 'lecturerId', as: 'coordinator' });
User.hasMany(Course, { foreignKey: 'lecturerId', as: 'coordinatedCourses' });

Semester.hasMany(Unit, { foreignKey: 'semesterId', as: 'units' });
Unit.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });

User.hasMany(Unit, { foreignKey: 'lecturerId', as: 'lecturerUnits' });
Unit.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });

Student.belongsToMany(Unit, { through: StudentUnit, foreignKey: 'studentId', otherKey: 'unitId', as: 'units' });
Unit.belongsToMany(Student, { through: StudentUnit, foreignKey: 'unitId', otherKey: 'studentId', as: 'students' });
StudentUnit.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
StudentUnit.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
StudentUnit.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' });

Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Result.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' });
Result.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
Result.belongsTo(User, { foreignKey: 'enteredBy', as: 'enteredByUser' });
Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Unit.hasMany(Result, { foreignKey: 'unitId', as: 'results' });
Semester.hasMany(Result, { foreignKey: 'semesterId', as: 'results' });

Fee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Fee.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
Student.hasMany(Fee, { foreignKey: 'studentId', as: 'fees' });
Semester.hasMany(Fee, { foreignKey: 'semesterId', as: 'fees' });

Payment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Payment.belongsTo(Fee, { foreignKey: 'feeId', as: 'fee' });
Payment.belongsTo(User, { foreignKey: 'processorId', as: 'processor' });
Student.hasMany(Payment, { foreignKey: 'studentId', as: 'payments' });
Fee.hasMany(Payment, { foreignKey: 'feeId', as: 'payments' });

Invoice.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Invoice.belongsTo(Fee, { foreignKey: 'feeId', as: 'fee' });
Student.hasMany(Invoice, { foreignKey: 'studentId', as: 'invoices' });
Fee.hasMany(Invoice, { foreignKey: 'feeId', as: 'invoices' });

Receipt.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });
Payment.hasOne(Receipt, { foreignKey: 'paymentId', as: 'receipt' });

HelbLoan.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Student.hasMany(HelbLoan, { foreignKey: 'studentId', as: 'helbLoans' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Salary.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
Salary.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });
User.hasMany(Salary, { foreignKey: 'lecturerId', as: 'salaries' });

module.exports = {
  sequelize,
  ...models,
};
