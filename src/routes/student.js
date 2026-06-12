const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const { authorize, ROLES } = require('../middleware/rbac');

router.use(authenticate, authorize(ROLES.STUDENT));

router.get('/profile', studentController.getProfile);
router.get('/current-units', studentController.getCurrentUnits);
router.get('/current-semester', studentController.getCurrentSemester);
router.get('/transcript', studentController.getTranscript);
router.get('/transcript/download', studentController.downloadTranscript);
router.get('/fees/balance', studentController.getFeesBalance);
router.get('/fees/payments', studentController.getPaymentHistory);
router.get('/fees/receipts', studentController.getReceipts);
router.get('/fees/receipts/:id/download', studentController.downloadReceipt);

module.exports = router;
