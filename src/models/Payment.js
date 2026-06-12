const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Payment extends Model {}

Payment.init(
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
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'payment_date',
    },
    method: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'mpesa', 'cheque', 'helb', 'other'),
      allowNull: false,
    },
    receiptNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'receipt_no',
    },
    transactionCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'transaction_code',
    },
    processorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'processor_id',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mpesaMerchantRequestId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'mpesa_merchant_request_id',
    },
    mpesaCheckoutRequestId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'mpesa_checkout_request_id',
    },
    mpesaResponseCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'mpesa_response_code',
    },
    mpesaResultCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'mpesa_result_code',
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
  }
);

module.exports = Payment;
