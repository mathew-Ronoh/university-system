const { Student, User, Course, Semester, Unit, StudentUnit, Result, Fee, Payment, Receipt } = require('../models');
const reportService = require('../services/reportService');

const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Course, as: 'course' },
        { model: Semester, as: 'currentSemester' },
      ],
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });
    res.json({ student });
  } catch (error) {
    next(error);
  }
};

const getCurrentUnits = async (req, res, next) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const studentUnits = await StudentUnit.findAll({
      where: { studentId: student.id },
      include: [
        {
          model: Unit,
          as: 'unit',
          include: [
            { model: Course, as: 'course' },
            { model: User, as: 'lecturer', attributes: ['id', 'firstName', 'lastName'] },
          ],
        },
        { model: Semester, as: 'semester' },
      ],
      order: [[{ model: Unit, as: 'unit' }, 'code', 'ASC']],
    });

    res.json({ units: studentUnits.map((su) => ({ ...su.unit.toJSON(), semester: su.semester })) });
  } catch (error) {
    next(error);
  }
};

const getCurrentSemester = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [{ model: Semester, as: 'currentSemester' }],
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ semester: student.currentSemester });
  } catch (error) {
    next(error);
  }
};

const getTranscript = async (req, res, next) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const results = await Result.findAll({
      where: { studentId: student.id },
      include: [
        { model: Unit, as: 'unit' },
        { model: Semester, as: 'semester' },
      ],
      order: [
        [{ model: Semester, as: 'semester' }, 'startDate', 'ASC'],
        [{ model: Unit, as: 'unit' }, 'code', 'ASC'],
      ],
    });

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

const downloadTranscript = async (req, res, next) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const doc = await reportService.generateTranscript(student.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transcript_${student.admissionNo}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};

const getFeesBalance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const fees = await Fee.findAll({
      where: { studentId: student.id },
      include: [{ model: Semester, as: 'semester' }],
      order: [['createdAt', 'DESC']],
    });

    const totalOwed = fees.reduce((sum, f) => sum + parseFloat(f.totalFees), 0);
    const totalPaid = fees.reduce((sum, f) => sum + parseFloat(f.paidAmount), 0);
    const totalBalance = fees.reduce((sum, f) => sum + parseFloat(f.balance), 0);

    res.json({
      fees,
      summary: {
        totalOwed: totalOwed.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        totalBalance: totalBalance.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const payments = await Payment.findAll({
      where: { studentId: student.id, status: 'completed' },
      include: [{ model: Fee, as: 'fee' }],
      order: [['paymentDate', 'DESC']],
    });

    res.json({ payments });
  } catch (error) {
    next(error);
  }
};

const getReceipts = async (req, res, next) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const receipts = await Receipt.findAll({
      include: [
        {
          model: Payment,
          as: 'payment',
          where: { studentId: student.id },
          include: [{ model: Fee, as: 'fee' }],
        },
      ],
      order: [['generatedAt', 'DESC']],
    });

    res.json({ receipts });
  } catch (error) {
    next(error);
  }
};

const downloadReceipt = async (req, res, next) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const receipt = await Receipt.findByPk(req.params.id, {
      include: [{ model: Payment, as: 'payment', where: { studentId: student.id } }],
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

module.exports = {
  getProfile,
  getCurrentUnits,
  getCurrentSemester,
  getTranscript,
  downloadTranscript,
  getFeesBalance,
  getPaymentHistory,
  getReceipts,
  downloadReceipt,
};
