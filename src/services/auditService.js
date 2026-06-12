const { AuditLog } = require('../models');

const getAuditLogs = async (query = {}) => {
  const where = {};
  if (query.userId) where.userId = query.userId;
  if (query.action) where.action = query.action;
  if (query.entityType) where.entityType = query.entityType;

  return AuditLog.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: Math.min(parseInt(query.limit, 10) || 100, 500),
    offset: parseInt(query.offset, 10) || 0,
  });
};

module.exports = { getAuditLogs };
