// Report service — generates PDF documents using PDFKit
// Two reports: academic transcripts and payment receipts
// Returns a PDFDocument stream that the controller pipes to the HTTP response

const PDFDocument = require('pdfkit');
const { Student, User, Course, Result, Unit, Semester, Fee, Payment } = require('../models');

const generateTranscript = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    include: [
      { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
      { model: Course, as: 'course' },
    ],
  });
  if (!student) throw { status: 404, message: 'Student not found.' };

  // Fetch all results grouped by semester for structured display
  const results = await Result.findAll({
    where: { studentId },
    include: [
      { model: Unit, as: 'unit' },
      { model: Semester, as: 'semester' },
    ],
    order: [
      [{ model: Semester, as: 'semester' }, 'startDate', 'ASC'],
      [{ model: Unit, as: 'unit' }, 'code', 'ASC'],
    ],
  });

  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc.fontSize(18).text('ACADEMIC TRANSCRIPT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Student: ${student.user.firstName} ${student.user.lastName}`);
  doc.text(`Admission No: ${student.admissionNo}`);
  doc.text(`Course: ${student.course.name}`);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Group results by semester
  const semesterGroups = {};
  for (const r of results) {
    const semKey = r.semester.id;
    if (!semesterGroups[semKey]) {
      semesterGroups[semKey] = { semester: r.semester, results: [] };
    }
    semesterGroups[semKey].results.push(r);
  }

  // Render each semester as a table
  for (const key of Object.keys(semesterGroups)) {
    const { semester, results: semResults } = semesterGroups[key];
    doc.fontSize(14).text(`${semester.name} (${semester.academicYear})`, { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Code', 50, tableTop, { width: 80 });
    doc.text('Unit Name', 130, tableTop, { width: 200 });
    doc.text('Credits', 340, tableTop, { width: 50, align: 'center' });
    doc.text('Marks', 400, tableTop, { width: 50, align: 'center' });
    doc.text('Grade', 460, tableTop, { width: 50, align: 'center' });
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(510, doc.y).stroke();
    doc.moveDown(0.3);

    for (const r of semResults) {
      doc.text(r.unit.code, 50, doc.y, { width: 80 });
      doc.text(r.unit.name, 130, doc.y, { width: 200 });
      doc.text(String(r.unit.credits), 340, doc.y, { width: 50, align: 'center' });
      doc.text(r.marks !== null ? String(r.marks) : '-', 400, doc.y, { width: 50, align: 'center' });
      doc.text(r.grade || '-', 460, doc.y, { width: 50, align: 'center' });
      doc.moveDown(0.4);
    }
    doc.moveDown(0.5);
  }

  return doc;
};

const generateReceipt = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId, {
    include: [
      {
        model: Student,
        as: 'student',
        include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }],
      },
    ],
  });
  if (!payment) throw { status: 404, message: 'Payment not found.' };

  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(18).text('OFFICIAL RECEIPT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);
  doc.text(`Receipt No: ${payment.receiptNo || 'N/A'}`, { align: 'right' });
  doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(1);

  doc.text(`Received from: ${payment.student.user.firstName} ${payment.student.user.lastName}`);
  doc.text(`Admission No: ${payment.student.admissionNo}`);
  doc.moveDown(0.5);

  doc.moveTo(50, doc.y).lineTo(510, doc.y).stroke();
  doc.moveDown(0.5);

  doc.text(`Amount: KES ${parseFloat(payment.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`);
  doc.text(`Payment Method: ${payment.method.toUpperCase()}`);
  if (payment.transactionCode) {
    doc.text(`Transaction Code: ${payment.transactionCode}`);
  }
  doc.text(`Status: ${payment.status.toUpperCase()}`);

  doc.moveDown(2);
  doc.fontSize(8).text('This is a computer-generated receipt.', { align: 'center' });

  return doc;
};

module.exports = { generateTranscript, generateReceipt };
