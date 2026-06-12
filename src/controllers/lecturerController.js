const { Unit, User, Student, StudentUnit, Result, Semester, Course } = require('../models');
const resultService = require('../services/resultService');
const { auditLog } = require('../middleware/audit');

const getMyCourses = async (req, res, next) => {
  try {
    const units = await Unit.findAll({
      where: { lecturerId: req.user.id },
      include: [
        { model: Course, as: 'course' },
        { model: Semester, as: 'semester' },
      ],
      order: [['code', 'ASC']],
    });
    res.json({ units });
  } catch (error) {
    next(error);
  }
};

const getCourseStudents = async (req, res, next) => {
  try {
    const unit = await Unit.findOne({
      where: { id: req.params.id, lecturerId: req.user.id },
    });
    if (!unit) return res.status(404).json({ error: 'Unit not found or not assigned to you.' });

    const students = await Student.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Unit,
          as: 'units',
          where: { id: unit.id },
          through: { attributes: [] },
        },
      ],
      order: [[{ model: User, as: 'user' }, 'firstName', 'ASC']],
    });

    res.json({ students });
  } catch (error) {
    next(error);
  }
};

const getUnitResults = async (req, res, next) => {
  try {
    const unit = await Unit.findOne({
      where: { id: req.params.id, lecturerId: req.user.id },
    });
    if (!unit) return res.status(404).json({ error: 'Unit not found or not assigned to you.' });

    const semesterId = req.query.semesterId || unit.semesterId;
    const results = await resultService.getUnitResults(unit.id, semesterId);

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = req.user.toSafeObject();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateResults = async (req, res, next) => {
  try {
    const unit = await Unit.findOne({
      where: { id: req.params.id, lecturerId: req.user.id },
    });
    if (!unit) return res.status(404).json({ error: 'Unit not found or not assigned to you.' });

    const semesterId = req.body.semesterId || unit.semesterId;

    if (Array.isArray(req.body.results)) {
      const processed = await resultService.bulkUpsertResults(
        unit.id,
        semesterId,
        req.body.results,
        req.user.id
      );

      auditLog({
        userId: req.user.id,
        action: 'BULK_UPDATE_RESULTS',
        entityType: 'Result',
        entityId: unit.id,
        newValues: { count: processed.length },
        req,
      });

      return res.json({ results: processed, message: `${processed.length} results updated.` });
    }

    const { result, created } = await resultService.upsertResult(
      { ...req.body, unitId: unit.id, semesterId },
      req.user.id
    );

    auditLog({
      userId: req.user.id,
      action: created ? 'CREATE_RESULT' : 'UPDATE_RESULT',
      entityType: 'Result',
      entityId: result.id,
      req,
    });

    res.json({ result, message: created ? 'Result created.' : 'Result updated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getMyCourses,
  getCourseStudents,
  getUnitResults,
  updateResults,
};
