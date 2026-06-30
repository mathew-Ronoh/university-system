const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const lecturerRoutes = require('./routes/lecturer');
const financeRoutes = require('./routes/finance');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────
// These run on EVERY request before reaching any route handler

// Security: sets HTTP headers (X-Frame-Options, CSP, etc.) to prevent common web attacks
app.use(helmet());

// Cross-Origin Resource Sharing — allows frontend from different origin to call this API
app.use(cors());

// HTTP request logger — logs method, URL, status code, and response time in dev format
app.use(morgan('dev'));

// Parse incoming JSON request bodies (limit 10MB for avatar uploads)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data (for traditional form submissions)
app.use(express.urlencoded({ extended: true }));

// Rate limiter — only active in production to prevent abuse
// Limits each IP to 100 requests per 15-minute window
if (config.env === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use(limiter);
}

// ─── Routes ───────────────────────────────────────────────────────────

// Simple health check endpoint (no auth required) — used by load balancers and monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount route groups under their respective prefixes
app.use('/api/auth', authRoutes);       // Public auth routes (login, refresh)
app.use('/api/admin', adminRoutes);     // Admin-only routes (authenticate + RBAC applied inside)
app.use('/api/student', studentRoutes);  // Student-only routes
app.use('/api/lecturer', lecturerRoutes); // Lecturer-only routes
app.use('/api/finance', financeRoutes);   // Finance-only routes

// Serve uploaded files (avatars, PDFs) as static assets at /uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 handler — if no route matched, return a clean JSON error
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler — catches all errors thrown via next(error) from controllers/middleware
app.use(errorHandler);

module.exports = app;
