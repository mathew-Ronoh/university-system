const Joi = require('joi');

const courseSchema = Joi.object({
  code: Joi.string().max(20).required(),
  name: Joi.string().max(200).required(),
  credits: Joi.number().integer().min(1).max(300).required(),
  department: Joi.string().max(200).optional().allow(''),
  description: Joi.string().optional().allow(''),
  fee: Joi.number().positive().precision(2).required(),
});

const unitSchema = Joi.object({
  code: Joi.string().max(20).required(),
  name: Joi.string().max(200).required(),
  credits: Joi.number().integer().min(1).max(30).required(),
  courseId: Joi.number().integer().required(),
  semesterId: Joi.number().integer().optional().allow(null),
  lecturerId: Joi.number().integer().optional().allow(null),
});

const semesterSchema = Joi.object({
  name: Joi.string().max(100).required(),
  academicYear: Joi.string().max(20).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  isCurrent: Joi.boolean().optional(),
});

module.exports = { courseSchema, unitSchema, semesterSchema };
