const { AuditLog } = require('../models');

const auditLog = async ({ userId, action, entityType, entityId, oldValues = null, newValues = null, req = null }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

const auditMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || body?.id || null;
        auditLog({
          userId: req.user?.id,
          action,
          entityType,
          entityId,
          req,
        }).catch(console.error);
      }
      return originalJson(body);
    };
    next();
  };
};

module.exports = { auditLog, auditMiddleware };
