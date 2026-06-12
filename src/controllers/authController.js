const authService = require('../services/authService');
const { auditLog } = require('../middleware/audit');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    auditLog({
      userId: result.user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: result.user.id,
      req,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  auditLog({
    userId: req.user?.id,
    action: 'LOGOUT',
    entityType: 'User',
    entityId: req.user?.id,
    req,
  });
  res.json({ message: 'Logged out successfully.' });
};

const me = async (req, res) => {
  const user = req.user.toSafeObject();

  if (user.role === 'student') {
    const { Student, Course, Semester } = require('../models');
    const profile = await Student.findOne({
      where: { userId: user.id },
      include: [
        { model: Course, as: 'course' },
        { model: Semester, as: 'currentSemester' },
      ],
    });
    user.studentProfile = profile;
  }

  res.json({ user });
};

module.exports = { login, refresh, logout, me };
