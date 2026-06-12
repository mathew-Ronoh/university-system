const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize, ROLES } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { feeSchema, manualPaymentSchema, mpesaPaymentSchema, invoiceSchema } = require('../validators/feeValidator');

router.post('/payments/mpesa-callback', optionalAuth, financeController.mpesaCallback);

router.use(authenticate, authorize(ROLES.FINANCE));

router.get('/students/:id/fees', financeController.getStudentFees);
router.put('/students/:id/fees', validate(feeSchema), financeController.updateStudentFees);
router.get('/students/:id/payments', financeController.getStudentPayments);
router.post('/students/:id/payments/manual', validate(manualPaymentSchema), financeController.recordManualPayment);
router.post('/students/:id/payments/mpesa-stk', validate(mpesaPaymentSchema), financeController.initiateMpesaPayment);
router.get('/students/:id/invoices', financeController.getStudentInvoices);
router.post('/students/:id/invoices', validate(invoiceSchema), financeController.createInvoice);
router.get('/reports/student/:id', financeController.getFinancialReport);
router.get('/receipts/:id/download', financeController.downloadReceipt);

router.get('/students/:id/helb', financeController.getHelbLoans);
router.post('/students/:id/helb', financeController.createHelbLoan);

router.put('/payments/:id', financeController.updatePayment);
router.delete('/payments/:id', financeController.deletePayment);

const salaryController = require('../controllers/salaryController');
router.get('/salaries', salaryController.getAll);
router.put('/salaries/:id', salaryController.update);
router.post('/salaries/:id/mark-paid', salaryController.markPaid);

module.exports = router;
