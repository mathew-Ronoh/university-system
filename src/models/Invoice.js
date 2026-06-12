const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Invoice extends Model {}

Invoice.init(
  {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
    },
    feeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'fee_id',
    },
    invoiceNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'invoice_no',
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    issuedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'issued_date',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date',
    },
    status: {
      type: DataTypes.ENUM('draft', 'issued', 'paid', 'cancelled', 'overdue'),
      defaultValue: 'draft',
    },
  },
  {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
  }
);

module.exports = Invoice;
