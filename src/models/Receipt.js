// Receipt model — proof of payment generated when a payment is completed
// One-to-one with Payment: each completed payment produces exactly one receipt
// pdfPath stores the location of the generated PDF file on disk

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Receipt extends Model {}

Receipt.init(
  {
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,       // One receipt per payment, no duplicates
      field: 'payment_id',
    },
    receiptNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,       // e.g., "RCP-2026-XYZ12345"
      field: 'receipt_no',
    },
    generatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'generated_at',
    },
    pdfPath: {
      type: DataTypes.STRING(500),
      allowNull: true,    // Null until PDF is generated on demand
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
