const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Receipt extends Model {}

Receipt.init(
  {
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'payment_id',
    },
    receiptNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'receipt_no',
    },
    generatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'generated_at',
    },
    pdfPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'pdf_path',
    },
  },
  {
    sequelize,
    modelName: 'Receipt',
    tableName: 'receipts',
  }
);

module.exports = Receipt;
