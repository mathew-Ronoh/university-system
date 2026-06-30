// Audit service — reads from the audit_logs table with filtering and pagination
// Used by admin to view the audit trail

const { AuditLog } = require('../models');

const getAuditLogs = async (query = {}) => {
  const where = {};
  if (query.userId) where.userId = query.userId;
  if (query.action) where.action = query.action;
  if (query.entityType) where.entityType = query.entityType;

  return AuditLog.findAll({
    where,
    order: [['createdAt', 'DESC']],  // Most recent first
    limit: Math.min(parseInt(query.limit, 10) || 100, 500),  // Cap at 500
    offset: parseInt(query.offset, 10) || 0,
  });
};

module.exports = { getAuditLogs };
