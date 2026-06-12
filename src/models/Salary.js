const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Salary extends Model {}

Salary.init(
  {
    lecturerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'lecturer_id',
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '1-12',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'paid'),
      defaultValue: 'pending',
    },
    paidAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'paid_at',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'processed_by',
    },
  },
  {
    sequelize,
    modelName: 'Salary',
    tableName: 'salaries',
    indexes: [
      { unique: true, fields: ['lecturer_id', 'month', 'year'] },
    ],
  }
);

module.exports = Salary;
