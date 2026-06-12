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
      type: DataTypes.DECIMAL(12, 2),
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
