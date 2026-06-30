// Global error handler — catches all errors thrown via next(error) from controllers/services
// Must have exactly 4 parameters (err, req, res, next) — Express identifies it as error middleware
//
// Handles:
//   - Sequelize validation/unique constraint errors → 400 with field-level details
//   - Foreign key constraint errors → 400 with clear message
//   - Custom errors with err.status property → dynamic status code
//   - Everything else → 500 Internal server error

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize model validation or unique constraint violation
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Foreign key violation — referenced record doesn't exist
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Referenced record not found.',
    });
  }

  // Custom business-logic errors thrown from services/controllers
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Fallback — unexpected errors
  res.status(500).json({ error: 'Internal server error.' });
};

module.exports = errorHandler;
