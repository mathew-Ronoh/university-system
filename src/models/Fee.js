// Fee model — tracks what a student owes for a specific semester
// totalFees is the full semester cost, paidAmount tracks what's been paid,
// balance = totalFees - paidAmount, and status changes automatically

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Fee extends Model {}

Fee.init(
  {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
    },
    semesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'semester_id',
    },
    totalFees: {
      type: DataTypes.DECIMAL(12, 2),  // Up to 99,999,999,999.99 — handles KES amounts safely
      allowNull: false,
      field: 'total_fees',
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
      field: 'paid_amount',
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date',
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Fee',
    tableName: 'fees',
  }
);

module.exports = Fee;
