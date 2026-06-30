// Joi validation schemas for authentication and user management
// Each schema defines the expected shape, types, and constraints of request bodies

const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// When role is 'student', admissionNo and courseId become required via .when()
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('student', 'lecturer', 'finance', 'admin').required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  phone: Joi.string().max(20).optional().allow(''),
  admissionNo: Joi.when('role', { is: 'student', then: Joi.string().required(), otherwise: Joi.optional() }),
  courseId: Joi.when('role', { is: 'student', then: Joi.number().integer().required(), otherwise: Joi.optional() }),
  enrollmentDate: Joi.date().optional(),
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  phone: Joi.string().max(20).optional().allow(''),
  isActive: Joi.boolean().optional(),
}).min(1); // At least one field must be provided for an update

// Schemas below are defined but not currently wired into any route
// They exist as placeholders for future password management features

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  phone: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().optional(),
}).min(1);

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
};
