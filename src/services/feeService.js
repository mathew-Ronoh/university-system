// Fee service — manages fee records, payments, receipts, and invoices
// Uses database TRANSACTIONS to ensure financial data stays consistent
// Critical operations (payments) either fully succeed or fully roll back

const { Fee, Payment, Receipt, Invoice, Student, Semester } = require('../models');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getStudentFees = async (studentId) => {
  return Fee.findAll({
    where: { studentId },
    include: [{ model: Semester, as: 'semester' }],
    order: [['createdAt', 'DESC']],
  });
};

// Creates a fee record AND an invoice for the student simultaneously
const createFee = async (studentId, data) => {
  const fee = await Fee.create({
    studentId,
    semesterId: data.semesterId,
    totalFees: data.totalFees,
    paidAmount: 0,
    balance: data.totalFees,
    dueDate: data.dueDate,
    status: 'pending',
  });

  const invoiceNo = `INV-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
  await Invoice.create({
    studentId,
    feeId: fee.id,
    invoiceNo,
    amount: data.totalFees,
    issuedDate: new Date(),
    dueDate: data.dueDate,
    status: 'issued',
  });

  return fee;
};

// Record a manual payment in a TRANSACTION — creates payment, updates fee balance,
// generates receipt, and marks invoice as paid if balance reaches zero
const recordManualPayment = async (studentId, data, processorId) => {
  const transaction = await sequelize.transaction();
  try {
    // Find the oldest unpaid fee record
    const fee = await Fee.findOne({
      where: { studentId, status: ['pending', 'partial'] },
      order: [['createdAt', 'ASC']],
      transaction,
    });

    if (!fee) {
      throw { status: 400, message: 'No outstanding fees found.' };
    }

    const receiptNo = `RCP-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    const payment = await Payment.create(
      {
        studentId,
        feeId: fee.id,
        amount: data.amount,
        paymentDate: data.paymentDate,
        method: data.method,
        receiptNo,
        transactionCode: data.transactionCode || null,
        processorId,
        notes: data.notes || null,
        status: 'completed',
      },
      { transaction }
    );

    // Update the fee's paid amount and balance
    const newPaid = parseFloat(fee.paidAmount) + parseFloat(data.amount);
    const newBalance = parseFloat(fee.totalFees) - newPaid;

    await fee.update(
      {
        paidAmount: newPaid,
        balance: Math.max(0, newBalance),
        status: newBalance <= 0 ? 'paid' : 'partial',
      },
      { transaction }
    );

    const receipt = await Receipt.create(
      {
        paymentId: payment.id,
        receiptNo,
        generatedAt: new Date(),
      },
      { transaction }
    );

    // If fully paid, mark the invoice as paid too
    const invoice = await Invoice.findOne({
      where: { studentId, feeId: fee.id, status: 'issued' },
      transaction,
    });
    if (invoice && newBalance <= 0) {
      await invoice.update({ status: 'paid' }, { transaction });
    }

    await transaction.commit();
    return { payment, receipt, fee };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getStudentPayments = async (studentId) => {
  return Payment.findAll({
    where: { studentId },
    include: [{ model: Fee, as: 'fee' }],
    order: [['createdAt', 'DESC']],
  });
};

module.exports = {
  getStudentFees,
  createFee,
  recordManualPayment,
  getStudentPayments,
};
