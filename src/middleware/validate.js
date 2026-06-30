// Request validation middleware using Joi schemas
// validate(schema): validates req.body against the given Joi schema
// validateQuery(schema): validates req.query against a schema, sanitizes it
//
// On failure, returns 400 with a structured list of field-level errors
// On success, strips unknown fields (stripUnknown: true) and passes to next handler

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.query = value; // Replace with sanitized values
    next();
  };
};

module.exports = { validate, validateQuery };
