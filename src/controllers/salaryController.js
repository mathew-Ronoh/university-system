const salaryService = require('../services/salaryService');
const { auditLog } = require('../middleware/audit');
const { Salary } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const salaries = await salaryService.getAllSalaries(req.query);
    res.json({ salaries });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const salary = await salaryService.createSalary(req.body);
    auditLog({ userId: req.user.id, action: 'CREATE_SALARY', entityType: 'Salary', entityId: salary.id, req });
    res.status(201).json({ salary });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const salary = await salaryService.updateSalary(req.params.id, req.body);
    auditLog({ userId: req.user.id, action: 'UPDATE_SALARY', entityType: 'Salary', entityId: salary.id, req });
    res.json({ salary });
  } catch (error) { next(error); }
};

const markPaid = async (req, res, next) => {
  try {
    const salary = await salaryService.updateSalary(req.params.id, {
      status: 'paid',
      paidAt: new Date(),
      processedBy: req.user.id,
    });
    auditLog({ userId: req.user.id, action: 'MARK_SALARY_PAID', entityType: 'Salary', entityId: salary.id, req });
    res.json({ salary, message: 'Salary marked as paid.' });
  } catch (error) { next(error); }
};

const getMine = async (req, res, next) => {
  try {
    const salaries = await salaryService.getLecturerSalaries(req.user.id);
    res.json({ salaries });
  } catch (error) { next(error); }
};

const getLecturerList = async (req, res, next) => {
  try {
    const salaries = await salaryService.getLecturerSalaries(req.params.lecturerId);
    res.json({ salaries });
  } catch (error) { next(error); }
};

module.exports = { getAll, create, update, markPaid, getMine, getLecturerList };
