// Role-Based Access Control (RBAC) middleware
// After authentication confirms WHO you are, authorization checks WHAT you can do
//
// authorize(...roles): user must have EXACTLY one of the listed roles
// authorizeMinRole(role): uses hierarchy to allow users at or above a minimum level
//   hierarchy: student(0) < lecturer(1) < finance(2) < admin(3)

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden. Insufficient role permissions.',
        requiredRole: allowedRoles,
        yourRole: req.user.role,
      });
    }
    next();
  };
};

const ROLES = {
  STUDENT: 'student',
  LECTURER: 'lecturer',
  FINANCE: 'finance',
  ADMIN: 'admin',
};

const ROLES_HIERARCHY = {
  student: 0,
  lecturer: 1,
  finance: 2,
  admin: 3,
};

const authorizeMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const userLevel = ROLES_HIERARCHY[req.user.role];
    const requiredLevel = ROLES_HIERARCHY[minRole];
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Forbidden. Insufficient permissions.',
        minimumRoleRequired: minRole,
      });
    }
    next();
  };
};

module.exports = { authorize, authorizeMinRole, ROLES };
