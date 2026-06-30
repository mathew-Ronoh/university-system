// User model — represents every person in the system regardless of role
// Uses bcrypt to hash passwords automatically before saving
// Roles: student, lecturer, finance, admin — each gates access to different APIs

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
  // Compare a plain-text password against the stored hash — used during login
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  // Return user data without the password hash — never expose it in API responses
  toSafeObject() {
    const { password, ...safe } = this.toJSON();
    return safe;
  }
}

User.init(
  {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,              // No two users can share the same email
      validate: { isEmail: true }, // Basic format check at Sequelize level
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('student', 'lecturer', 'finance', 'admin'),
      allowNull: false,
      defaultValue: 'student',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',        // Maps to snake_case column in MySQL
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',         // Admin can deactivate accounts without deleting
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login',
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'avatar_url',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    // Hooks: lifecycle events that run automatically
    hooks: {
      // Hash password BEFORE creating a new user
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
      // Hash password BEFORE updating ONLY if the password field actually changed
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

module.exports = User;
