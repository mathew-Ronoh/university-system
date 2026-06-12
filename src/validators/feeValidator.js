const Joi = require('joi');

const feeSchema = Joi.object({
  totalFees: Joi.number().positive().precision(2).required(),
  semesterId: Joi.number().integer().required(),
  dueDate: Joi.date().optional(),
});

const manualPaymentSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  method: Joi.string()
    .valid('cash', 'bank_transfer', 'cheque', 'helb', 'other')
    .required(),
  paymentDate: Joi.date().required(),
  transactionCode: Joi.string().max(100).optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const mpesaPaymentSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  phone: Joi.string()
    .pattern(/^(254|0)[17]\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be a valid Kenyan Safaricom number (e.g., 2547XXXXXXXX)',
    }),
});

const invoiceSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  dueDate: Joi.date().optional(),
  status: Joi.string()
    .valid('draft', 'issued', 'paid', 'cancelled')
    .optional(),
});

module.exports = {
  feeSchema,
  manualPaymentSchema,
  mpesaPaymentSchema,
  invoiceSchema,
};
