// AuditLog model — immutable record of every significant action in the system
// Stores who (userId) did what (action) to which entity (entityType + entityId)
// oldValues/newValues store JSON snapshots of data before/after the change
// ipAddress and userAgent provide forensic context
// This table is append-only: createdAt exists but no updatedAt

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class AuditLog extends Model {}

AuditLog.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,     // e.g., LOGIN, CREATE_USER, DELETE_COURSE, RECORD_PAYMENT
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,     // e.g., User, Course, Payment, Fee
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'entity_id',
    },
    oldValues: {
      type: DataTypes.JSON,
      allowNull: true,      // Snapshot of previous state (null for CREATE actions)
      field: 'old_values',
    },
    newValues: {
      type: DataTypes.JSON,
      allowNull: true,      // Snapshot of new state (null for DELETE actions)
      field: 'new_values',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,      // IPv6 addresses max 45 chars
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,       // Only createdAt — logs are immutable once written
  }
);

module.exports = AuditLog;
