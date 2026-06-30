// User service — handles user creation with automatic student profile and fee setup
// Business logic is centralized here rather than in controllers to keep them thin

const { User, Student, Fee, Course, Semester } = require('../models');

// Create a user, and if they're a student, also create their student profile
// and automatically generate a fee record for the current semester
const createUser = async (data) => {
  const user = await User.create(data);

  if (data.role === 'student' && data.admissionNo) {
    const student = await Student.create({
      userId: user.id,
      admissionNo: data.admissionNo,
      courseId: data.courseId,
      enrollmentDate: data.enrollmentDate || new Date(),
    });

    // Auto-generate fee record based on the course's tuition fee
    if (data.courseId) {
      const course = await Course.findByPk(data.courseId);
      const currentSemester = await Semester.findOne({ where: { isCurrent: true } });
      if (course && course.fee > 0 && currentSemester) {
        await Fee.create({
          studentId: student.id,
          semesterId: currentSemester.id,
          totalFees: course.fee,
          paidAmount: 0,
          balance: course.fee,
          dueDate: currentSemester.endDate,
          status: 'pending',
        });
      }
    }
  }

  return user.toSafeObject();
};

const updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found.' };

  await user.update(data);
  return user.toSafeObject();
};

const getUsersByRole = async (role, options = {}) => {
  const where = { role };
  if (options.isActive !== undefined) where.isActive = options.isActive;
  return User.findAll({
    where,
    attributes: { exclude: ['password'] },
    include: options.include || [],
    order: [['createdAt', 'DESC']],
  });
};

const toggleUserActive = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found.' };
  await user.update({ isActive: !user.isActive });
  return user.toSafeObject();
};

module.exports = { createUser, updateUser, getUsersByRole, toggleUserActive };
