const userService = require('../services/userService');
const auditService = require('../services/auditService');
const { auditLog } = require('../middleware/audit');
const { User, Course, Unit, Student, Semester } = require('../models');

const assignCourseLecturer = async (req, res, next) => {
  try {
    const { courseId, lecturerId } = req.body;
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const lecturer = lecturerId ? await User.findOne({ where: { id: lecturerId, role: 'lecturer' } }) : null;
    if (lecturerId && !lecturer) return res.status(400).json({ error: 'Invalid lecturer.' });

    const prev = course.lecturerId;
    await course.update({ lecturerId: lecturerId || null });

    auditLog({
      userId: req.user.id, action: 'ASSIGN_COURSE_LECTURER', entityType: 'Course', entityId: course.id,
      oldValues: { lecturerId: prev }, newValues: { lecturerId: lecturerId || null }, req,
    });

    res.json({ course, message: 'Course coordinator assigned.' });
  } catch (error) { next(error); }
};

const getUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    auditLog({
      userId: req.user.id,
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, role: user.role },
      req,
    });

    res.status(201).json({ user, message: 'User created successfully.' });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    auditLog({
      userId: req.user.id,
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: user.id,
      req,
    });

    res.json({ user, message: 'User updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await user.update({ isActive: false, email: `deleted_${user.id}_${user.email}` });

    auditLog({
      userId: req.user.id,
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: parseInt(req.params.id),
      req,
    });

    res.json({ message: 'User deactivated and removed.' });
  } catch (error) {
    next(error);
  }
};

const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.update({ avatarUrl });

    auditLog({
      userId: req.user.id,
      action: 'UPDATE_USER_AVATAR',
      entityType: 'User',
      entityId: user.id,
      newValues: { avatarUrl },
      req,
    });

    res.json({ user: user.toSafeObject(), message: 'Avatar updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await userService.toggleUserActive(req.params.id);

    auditLog({
      userId: req.user.id,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entityType: 'User',
      entityId: user.id,
      req,
    });

    res.json({ user, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, as: 'coordinator', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['name', 'ASC']],
    });
    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);

    auditLog({
      userId: req.user.id,
      action: 'CREATE_COURSE',
      entityType: 'Course',
      entityId: course.id,
      req,
    });

    res.status(201).json({ course });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    await course.update(req.body);

    auditLog({
      userId: req.user.id,
      action: 'UPDATE_COURSE',
      entityType: 'Course',
      entityId: course.id,
      req,
    });

    res.json({ course });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    await course.destroy();

    auditLog({
      userId: req.user.id,
      action: 'DELETE_COURSE',
      entityType: 'Course',
      entityId: parseInt(req.params.id),
      req,
    });

    res.json({ message: 'Course deleted.' });
  } catch (error) {
    next(error);
  }
};

const getUnits = async (req, res, next) => {
  try {
    const units = await Unit.findAll({
      include: [
        { model: Course, as: 'course' },
        { model: Semester, as: 'semester' },
        { model: User, as: 'lecturer', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['code', 'ASC']],
    });
    res.json({ units });
  } catch (error) {
    next(error);
  }
};

const createUnit = async (req, res, next) => {
  try {
    const unit = await Unit.create(req.body);

    auditLog({
      userId: req.user.id,
      action: 'CREATE_UNIT',
      entityType: 'Unit',
      entityId: unit.id,
      req,
    });

    res.status(201).json({ unit });
  } catch (error) {
    next(error);
  }
};

const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found.' });
    await unit.update(req.body);

    auditLog({
      userId: req.user.id,
      action: 'UPDATE_UNIT',
      entityType: 'Unit',
      entityId: unit.id,
      req,
    });

    res.json({ unit });
  } catch (error) {
    next(error);
  }
};

const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found.' });
    await unit.destroy();

    auditLog({
      userId: req.user.id,
      action: 'DELETE_UNIT',
      entityType: 'Unit',
      entityId: parseInt(req.params.id),
      req,
    });

    res.json({ message: 'Unit deleted.' });
  } catch (error) {
    next(error);
  }
};

const assignLecturer = async (req, res, next) => {
  try {
    const { unitId, lecturerId } = req.body;
    const unit = await Unit.findByPk(unitId);
    if (!unit) return res.status(404).json({ error: 'Unit not found.' });

    const lecturer = await User.findOne({ where: { id: lecturerId, role: 'lecturer' } });
    if (!lecturer) return res.status(400).json({ error: 'Invalid lecturer.' });

    const previousLecturerId = unit.lecturerId;
    await unit.update({ lecturerId });

    auditLog({
      userId: req.user.id,
      action: 'ASSIGN_LECTURER',
      entityType: 'Unit',
      entityId: unit.id,
      oldValues: { lecturerId: previousLecturerId },
      newValues: { lecturerId },
      req,
    });

    res.json({ unit, message: 'Lecturer assigned successfully.' });
  } catch (error) {
    next(error);
  }
};

const enrollStudent = async (req, res, next) => {
  try {
    const { studentId, unitIds, semesterId } = req.body;

    if (!studentId) return res.status(400).json({ error: 'studentId is required.' });
    if (!semesterId) return res.status(400).json({ error: 'semesterId is required.' });
    if (!Array.isArray(unitIds) || unitIds.length === 0) {
      return res.status(400).json({ error: 'unitIds must be a non-empty array.' });
    }

    const { StudentUnit } = require('../models');

    const student = await Student.findByPk(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const semester = await Semester.findByPk(semesterId);
    if (!semester) return res.status(404).json({ error: 'Semester not found.' });

    const existingEnrollments = await StudentUnit.findAll({
      where: { studentId, semesterId },
    });
    const existingUnitIds = new Set(existingEnrollments.map((e) => e.unitId));

    const enrollments = [];
    const alreadyEnrolled = [];
    for (const unitId of unitIds) {
      if (existingUnitIds.has(unitId)) {
        alreadyEnrolled.push(unitId);
        continue;
      }
      const enrollment = await StudentUnit.create({ studentId, unitId, semesterId });
      enrollments.push(enrollment);
    }

    await student.update({ currentSemesterId: semesterId });

    auditLog({
      userId: req.user.id,
      action: 'ENROLL_STUDENT',
      entityType: 'Student',
      entityId: studentId,
      newValues: { unitIds, semesterId },
      req,
    });

    res.status(201).json({
      enrollments,
      alreadyEnrolled,
      message: alreadyEnrolled.length
        ? `Enrolled in ${enrollments.length} new unit(s). ${alreadyEnrolled.length} unit(s) already enrolled.`
        : `Enrolled in ${enrollments.length} unit(s) successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

const getSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.findAll({ order: [['startDate', 'DESC']] });
    res.json({ semesters });
  } catch (error) {
    next(error);
  }
};

const createSemester = async (req, res, next) => {
  try {
    if (req.body.isCurrent) {
      await Semester.update({ isCurrent: false }, { where: { isCurrent: true } });
    }
    const semester = await Semester.create(req.body);

    auditLog({
      userId: req.user.id,
      action: 'CREATE_SEMESTER',
      entityType: 'Semester',
      entityId: semester.id,
      req,
    });

    res.status(201).json({ semester });
  } catch (error) {
    next(error);
  }
};

const updateSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findByPk(req.params.id);
    if (!semester) return res.status(404).json({ error: 'Semester not found.' });

    if (req.body.isCurrent) {
      await Semester.update({ isCurrent: false }, { where: { isCurrent: true } });
    }

    await semester.update(req.body);

    auditLog({
      userId: req.user.id,
      action: 'UPDATE_SEMESTER',
      entityType: 'Semester',
      entityId: semester.id,
      req,
    });

    res.json({ semester });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditService.getAuditLogs(req.query);
    res.json({ auditLogs: logs });
  } catch (error) {
    next(error);
  }
};

const getLecturers = async (req, res, next) => {
  try {
    const lecturers = await User.findAll({
      where: { role: 'lecturer', isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email'],
    });
    res.json({ lecturers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserAvatar,
  toggleUserActive,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  assignLecturer,
  assignCourseLecturer,
  enrollStudent,
  getSemesters,
  createSemester,
  updateSemester,
  getAuditLogs,
  getLecturers,
};
