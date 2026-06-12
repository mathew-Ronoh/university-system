const { Result, Student, Unit, Semester, StudentUnit } = require('../models');
const sequelize = require('../config/database');

const getUnitResults = async (unitId, semesterId) => {
  return Result.findAll({
    where: { unitId, semesterId },
    include: [
      {
        model: Student,
        as: 'student',
        include: [{ association: 'user', attributes: ['firstName', 'lastName'] }],
      },
    ],
    order: [[sequelize.literal('student.admission_no'), 'ASC']],
  });
};

const upsertResult = async (data, enteredBy) => {
  const { studentId, unitId, semesterId, marks, grade } = data;

  const enrollment = await StudentUnit.findOne({
    where: { studentId, unitId, semesterId },
  });
  if (!enrollment) {
    throw { status: 400, message: 'Student is not enrolled in this unit.' };
  }

  const [result, created] = await Result.upsert(
    {
      studentId,
      unitId,
      semesterId,
      marks,
      grade,
      enteredBy,
    },
    { returning: true }
  );

  return { result, created };
};

const bulkUpsertResults = async (unitId, semesterId, results, enteredBy) => {
  const transaction = await sequelize.transaction();
  try {
    const processed = [];
    for (const r of results) {
      const enrollment = await StudentUnit.findOne({
        where: { studentId: r.studentId, unitId, semesterId },
        transaction,
      });
      if (!enrollment) {
        throw {
          status: 400,
          message: `Student ID ${r.studentId} is not enrolled in this unit.`,
        };
      }
      const [result] = await Result.upsert(
        {
          studentId: r.studentId,
          unitId,
          semesterId,
          marks: r.marks,
          grade: r.grade,
          enteredBy,
        },
        { transaction, returning: true }
      );
      processed.push(result);
    }
    await transaction.commit();
    return processed;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const calculateGrade = (marks) => {
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 40) return 'C+';
  if (marks >= 35) return 'C';
  if (marks >= 30) return 'D+';
  if (marks >= 25) return 'D';
  if (marks >= 20) return 'E';
  return 'F';
};

module.exports = { getUnitResults, upsertResult, bulkUpsertResults, calculateGrade };
