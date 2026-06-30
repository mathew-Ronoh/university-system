// Audit logging — records every significant action in the audit_logs table
// Two usage patterns:
//   auditLog({...}): called directly from controllers after an action completes
//   auditMiddleware(action, entity): Express middleware that intercepts the response
//
// Captures: who (userId), what (action), which entity (type + id), data diff (old/new),
// and request metadata (IP address, user agent)

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

// Express middleware version — intercepts res.json() to automatically log the action
// Currently defined but not used in routes (controllers call auditLog directly instead)
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
