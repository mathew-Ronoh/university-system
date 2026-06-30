// Joi validation schemas for academic results
// Used by lecturer routes when entering grades
// Validated: student must exist, marks 0-100, grade must be valid Kenyan grade

const Joi = require('joi');

const resultSchema = Joi.object({
  studentId: Joi.number().integer().required(),
  marks: Joi.number().min(0).max(100).required(),
  grade: Joi.string()
    .valid('A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'I')
    .optional(),
});

const bulkResultSchema = Joi.object({
  results: Joi.array().items(resultSchema).min(1).required(),
});

module.exports = { resultSchema, bulkResultSchema };
