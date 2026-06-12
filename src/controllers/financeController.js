const feeService = require('../services/feeService');
const mpesaService = require('../services/mpesaService');
const reportService = require('../services/reportService');
const { auditLog } = require('../middleware/audit');
const { Student, Payment, Receipt, User, HelbLoan, Semester } = require('../models');

const getStudentFees = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const fees = await feeService.getStudentFees(student.id);
    res.json({ fees });
  } catch (error) {
    next(error);
  }
};

const updateStudentFees = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const fee = await feeService.createFee(student.id, req.body);

    auditLog({
      userId: req.user.id,
      action: 'CREATE_FEE',
      entityType: 'Fee',
      entityId: fee.id,
      req,
    });

    res.status(201).json({ fee });
  } catch (error) {
    next(error);
  }
};

const recordManualPayment = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const result = await feeService.recordManualPayment(
      student.id,
      req.body,
      req.user.id
    );

    auditLog({
      userId: req.user.id,
      action: 'RECORD_PAYMENT',
      entityType: 'Payment',
      entityId: result.payment.id,
      newValues: { amount: req.body.amount, method: req.body.method },
      req,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const initiateMpesaPayment = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const user = await User.findByPk(student.userId);
    const { amount, phone } = req.body;

    const response = await mpesaService.stkPush(
      phone,
      amount,
      `FEES-${student.admissionNo}`,
      `University fees payment - ${user.firstName} ${user.lastName}`
    );

    const payment = await Payment.create({
      studentId: student.id,
      amount,
      paymentDate: new Date(),
      method: 'mpesa',
      status: 'pending',
      processorId: req.user.id,
      mpesaMerchantRequestId: response.MerchantRequestID,
      mpesaCheckoutRequestId: response.CheckoutRequestID,
      mpesaResponseCode: response.ResponseCode,
    });

    res.status(201).json({
      payment,
      mpesaResponse: {
        merchantRequestId: response.MerchantRequestID,
        checkoutRequestId: response.CheckoutRequestID,
        responseDescription: response.ResponseDescription,
        customerMessage: response.CustomerMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const mpesaCallback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    if (!Body?.stkCallback) return res.status(400).json({ error: 'Invalid callback.' });

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    const payment = await Payment.findOne({
      where: { mpesaCheckoutRequestId: CheckoutRequestID },
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });

    if (ResultCode === 0) {
      const metadata = {};
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          metadata[item.Name] = item.Value;
        }
      }

      await payment.update({
        status: 'completed',
        mpesaResultCode: String(ResultCode),
        transactionCode: metadata.MpesaReceiptNumber || ResultDesc,
        receiptNo: `RCP-MPESA-${metadata.MpesaReceiptNumber || Date.now()}`,
      });

      const receipt = await Receipt.create({
        paymentId: payment.id,
        receiptNo: payment.receiptNo,
        generatedAt: new Date(),
      });

      if (payment.feeId) {
        const fee = await require('../models').Fee.findByPk(payment.feeId);
        if (fee) {
          const newPaid = parseFloat(fee.paidAmount) + parseFloat(payment.amount);
          const newBalance = parseFloat(fee.totalFees) - newPaid;
          await fee.update({
            paidAmount: newPaid,
            balance: Math.max(0, newBalance),
            status: newBalance <= 0 ? 'paid' : 'partial',
          });
        }
      }
    } else {
      await payment.update({
        status: 'failed',
        mpesaResultCode: String(ResultCode),
        mpesaResponseCode: String(ResultCode),
      });
    }

    res.json({ message: 'Callback processed.' });
  } catch (error) {
    next(error);
  }
};

const getStudentPayments = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const payments = await feeService.getStudentPayments(student.id);
    res.json({ payments });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const invoice = await require('../models').Invoice.create({
      studentId: student.id,
      feeId: req.body.feeId || null,
      invoiceNo: `INV-${new Date().getFullYear()}-${Date.now()}`,
      amount: req.body.amount,
      issuedDate: new Date(),
      dueDate: req.body.dueDate || null,
      status: req.body.status || 'draft',
    });

    auditLog({
      userId: req.user.id,
      action: 'CREATE_INVOICE',
      entityType: 'Invoice',
      entityId: invoice.id,
      req,
    });

    res.status(201).json({ invoice });
  } catch (error) {
    next(error);
  }
};

const getStudentInvoices = async (req, res, next) => {
  try {
    const { Invoice } = require('../models');
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const invoices = await Invoice.findAll({
      where: { studentId: student.id },
      order: [['issuedDate', 'DESC']],
    });
    res.json({ invoices });
  } catch (error) {
    next(error);
  }
};

const getFinancialReport = async (req, res, next) => {
  try {
    const { Fee, Payment, Invoice } = require('../models');
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const fees = await Fee.findAll({
      where: { studentId: student.id },
      include: [{ model: require('../models').Semester, as: 'semester' }],
    });
    const payments = await Payment.findAll({
      where: { studentId: student.id, status: 'completed' },
    });
    const invoices = await Invoice.findAll({
      where: { studentId: student.id },
    });

    res.json({
      report: {
        studentId: student.id,
        admissionNo: student.admissionNo,
        fees,
        payments,
        invoices,
        summary: {
          totalFees: fees.reduce((s, f) => s + parseFloat(f.totalFees), 0).toFixed(2),
          totalPaid: payments.reduce((s, p) => s + parseFloat(p.amount), 0).toFixed(2),
          totalBalance: fees.reduce((s, f) => s + parseFloat(f.balance), 0).toFixed(2),
          totalInvoices: invoices.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const downloadReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id, {
      include: [{ model: Payment, as: 'payment' }],
    });
    if (!receipt) return res.status(404).json({ error: 'Receipt not found.' });

    const doc = await reportService.generateReceipt(receipt.paymentId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${receipt.receiptNo}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};

const getHelbLoans = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const loans = await HelbLoan.findAll({
      where: { studentId: student.id },
      order: [['academicYear', 'DESC']],
    });
    res.json({ loans });
  } catch (error) {
    next(error);
  }
};

const createHelbLoan = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const loan = await HelbLoan.create({
      studentId: student.id,
      ...req.body,
    });

    auditLog({
      userId: req.user.id,
      action: 'CREATE_HELB_LOAN',
      entityType: 'HelbLoan',
      entityId: loan.id,
      req,
    });

    res.status(201).json({ loan });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });

    const oldAmount = parseFloat(payment.amount);
    const oldStatus = payment.status;
    await payment.update(req.body);

    if (req.body.amount && parseFloat(req.body.amount) !== oldAmount && payment.feeId) {
      const fee = await require('../models').Fee.findByPk(payment.feeId);
      if (fee) {
        const diff = parseFloat(req.body.amount) - oldAmount;
        const newPaid = parseFloat(fee.paidAmount) + diff;
        const newBalance = parseFloat(fee.totalFees) - newPaid;
        await fee.update({
          paidAmount: Math.max(0, newPaid),
          balance: Math.max(0, newBalance),
          status: newBalance <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'pending',
        });
      }
    }

    auditLog({
      userId: req.user.id, action: 'UPDATE_PAYMENT', entityType: 'Payment', entityId: payment.id,
      oldValues: { amount: oldAmount, status: oldStatus },
      newValues: { amount: payment.amount, status: payment.status },
      req,
    });

    res.json({ payment, message: 'Payment updated.' });
  } catch (error) { next(error); }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });

    if (payment.feeId) {
      const fee = await require('../models').Fee.findByPk(payment.feeId);
      if (fee) {
        const newPaid = parseFloat(fee.paidAmount) - parseFloat(payment.amount);
        const newBalance = parseFloat(fee.totalFees) - newPaid;
        await fee.update({
          paidAmount: Math.max(0, newPaid),
          balance: Math.max(0, newBalance),
          status: newBalance <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'pending',
        });
      }
    }

    const receipt = await Receipt.findOne({ where: { paymentId: payment.id } });
    if (receipt) await receipt.destroy();
    await payment.destroy();

    auditLog({
      userId: req.user.id, action: 'DELETE_PAYMENT', entityType: 'Payment', entityId: parseInt(req.params.id), req,
    });

    res.json({ message: 'Payment deleted and fee recalculated.' });
  } catch (error) { next(error); }
};

module.exports = {
  getStudentFees,
  updateStudentFees,
  recordManualPayment,
  initiateMpesaPayment,
  mpesaCallback,
  getStudentPayments,
  createInvoice,
  getStudentInvoices,
  getFinancialReport,
  downloadReceipt,
  getHelbLoans,
  createHelbLoan,
  updatePayment,
  deletePayment,
};
