const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class HelbLoan extends Model {}

HelbLoan.init(
  {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
    },
    loanAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'loan_amount',
    },
    disbursedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
      field: 'disbursed_amount',
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'academic_year',
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'defaulted'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'HelbLoan',
    tableName: 'helb_loans',
  }
);

module.exports = HelbLoan;
