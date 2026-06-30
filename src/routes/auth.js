// Authentication routes — no auth middleware on login/refresh (they're public)
// Only /me and /logout require a valid JWT token via authenticate middleware

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../validators/authValidator');

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
