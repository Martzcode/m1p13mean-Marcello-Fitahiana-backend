const express = require('express');
const {
  getDashboardStats,
  getYearlyRevenue,
  getMerchantDashboardStats
} = require('../controllers/dashboardController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Admin routes
router.get('/stats', authorize('administrateur'), getDashboardStats);
router.get('/revenue/:year', authorize('administrateur'), getYearlyRevenue);

// Merchant routes
router.get('/merchant/stats', authorize('commerçant'), getMerchantDashboardStats);

module.exports = router;
