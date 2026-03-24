const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getUsers,
  toggleBanUser,
  verifyUser,
  getAnalytics,
  getReports,
  updateReport,
} = require('../controllers/adminController');
const { createReport } = require('../controllers/reportController');

// User-facing report route
router.post('/reports', protect, createReport);

// Admin routes
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/ban', protect, adminOnly, toggleBanUser);
router.put('/users/:id/verify', protect, adminOnly, verifyUser);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/reports', protect, adminOnly, getReports);
router.put('/reports/:id', protect, adminOnly, updateReport);

module.exports = router;
