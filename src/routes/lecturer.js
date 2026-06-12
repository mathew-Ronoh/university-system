const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const { authenticate } = require('../middleware/auth');
const { authorize, ROLES } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { resultSchema, bulkResultSchema } = require('../validators/resultValidator');

router.use(authenticate, authorize(ROLES.LECTURER));

router.get('/profile', lecturerController.getProfile);
router.get('/courses', lecturerController.getMyCourses);
router.get('/courses/:id/students', lecturerController.getCourseStudents);
router.get('/courses/:id/results', lecturerController.getUnitResults);
router.put('/courses/:id/results', lecturerController.updateResults);
router.post('/courses/:id/results/bulk', lecturerController.updateResults);

const salaryController = require('../controllers/salaryController');
router.get('/salary', salaryController.getMine);

module.exports = router;
