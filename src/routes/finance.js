// Finance routes — most require finance role
// Special case: M-Pesa callback is public (uses optionalAuth) because Safaricom servers
// call it directly without a user token
// All other routes use authenticate + authorize(FINANCE)

const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize, ROLES } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { feeSchema, manualPaymentSchema, mpesaPaymentSchema, invoiceSchema } = require('../validators/feeValidator');

// M-Pesa callback — called by Safaricom API, not by a logged-in user
router.post('/payments/mpesa-callback', optionalAuth, financeController.mpesaCallback);

router.use(authenticate, authorize(ROLES.FINANCE));

// Student fees
router.get('/students/:id/fees', financeController.getStudentFees);
router.put('/students/:id/fees', validate(feeSchema), financeController.updateStudentFees);

// Payments
router.get('/students/:id/payments', financeController.getStudentPayments);
router.post('/students/:id/payments/manual', validate(manualPaymentSchema), financeController.recordManualPayment);
router.post('/students/:id/payments/mpesa-stk', validate(mpesaPaymentSchema), financeController.initiateMpesaPayment);

// Invoices
router.get('/students/:id/invoices', financeController.getStudentInvoices);
router.post('/students/:id/invoices', validate(invoiceSchema), financeController.createInvoice);

// Reports & receipts
router.get('/reports/student/:id', financeController.getFinancialReport);
router.get('/receipts/:id/download', financeController.downloadReceipt);

// HELB loans
router.get('/students/:id/helb', financeController.getHelbLoans);
router.post('/students/:id/helb', financeController.createHelbLoan);

// Payment modifications
router.put('/payments/:id', financeController.updatePayment);
router.delete('/payments/:id', financeController.deletePayment);

// Salaries (finance can view and mark paid)
const salaryController = require('../controllers/salaryController');
router.get('/salaries', salaryController.getAll);
router.put('/salaries/:id', salaryController.update);
router.post('/salaries/:id/mark-paid', salaryController.markPaid);

module.exports = router;
