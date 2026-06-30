// Salary service — manages lecturer salary records
// Enforces one salary record per lecturer per month/year (unique constraint at DB + model level)

const { Salary, User } = require('../models');

const getLecturerSalaries = async (lecturerId) => {
  return Salary.findAll({
    where: { lecturerId },
    order: [['year', 'DESC'], ['month', 'DESC']],
  });
};

const getAllSalaries = async (query = {}) => {
  const where = {};
  if (query.lecturerId) where.lecturerId = query.lecturerId;
  if (query.status) where.status = query.status;
  return Salary.findAll({
    where,
    include: [
      { model: User, as: 'lecturer', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'processor', attributes: ['id', 'firstName', 'lastName'] },
    ],
    order: [['year', 'DESC'], ['month', 'DESC']],
  });
};

const createSalary = async (data) => {
  const existing = await Salary.findOne({
    where: { lecturerId: data.lecturerId, month: data.month, year: data.year },
  });
  if (existing) {
    throw { status: 400, message: 'Salary already exists for this period.' };
  }
  return Salary.create(data);
};

const updateSalary = async (id, data) => {
  const salary = await Salary.findByPk(id);
  if (!salary) throw { status: 404, message: 'Salary record not found.' };
  await salary.update(data);
  return salary;
};

module.exports = { getLecturerSalaries, getAllSalaries, createSalary, updateSalary };
