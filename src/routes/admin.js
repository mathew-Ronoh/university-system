const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize, ROLES } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/authValidator');
const { courseSchema, unitSchema, semesterSchema } = require('../validators/academicValidator');
const upload = require('../middleware/upload');

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/users', adminController.getUsers);
router.post('/users', validate(createUserSchema), adminController.createUser);
router.put('/users/:id', validate(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/toggle-active', adminController.toggleUserActive);
router.post('/users/:id/avatar', upload.single('avatar'), adminController.updateUserAvatar);

router.get('/lecturers', adminController.getLecturers);

router.get('/courses', adminController.getCourses);
router.post('/courses', validate(courseSchema), adminController.createCourse);
router.put('/courses/:id', validate(courseSchema), adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

router.get('/units', adminController.getUnits);
router.post('/units', validate(unitSchema), adminController.createUnit);
router.put('/units/:id', validate(unitSchema), adminController.updateUnit);
router.delete('/units/:id', adminController.deleteUnit);

router.post('/assign-lecturer', adminController.assignLecturer);
router.post('/assign-course-lecturer', adminController.assignCourseLecturer);
router.post('/enroll-student', adminController.enrollStudent);

router.get('/semesters', adminController.getSemesters);
router.post('/semesters', validate(semesterSchema), adminController.createSemester);
router.put('/semesters/:id', validate(semesterSchema), adminController.updateSemester);

router.get('/audit-logs', adminController.getAuditLogs);

const salaryController = require('../controllers/salaryController');
const Joi = require('joi');
const salarySchema = Joi.object({
  lecturerId: Joi.number().integer().required(),
  amount: Joi.number().positive().precision(2).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  notes: Joi.string().optional().allow(''),
});
router.get('/salaries', salaryController.getAll);
router.post('/salaries', validate(salarySchema), salaryController.create);
router.put('/salaries/:id', salaryController.update);
router.post('/salaries/:id/mark-paid', salaryController.markPaid);
router.get('/salaries/lecturer/:lecturerId', salaryController.getLecturerList);

module.exports = router;
