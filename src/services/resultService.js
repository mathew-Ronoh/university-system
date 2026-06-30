// Result service — manages academic results/grades for students
// Handles single and bulk result entry with enrollment validation
// calculateGrade() converts numerical marks to letter grades (Kenyan system)

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

// Create or update a single result — verifies the student is enrolled first
const upsertResult = async (data, enteredBy) => {
  const { studentId, unitId, semesterId, marks, grade } = data;

  // Guard: can't enter a grade for a student who isn't enrolled in this unit
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

// Bulk insert/update results in a TRANSACTION — all succeed or all roll back
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

// Convert marks (0-100) to Kenyan university letter grades
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
