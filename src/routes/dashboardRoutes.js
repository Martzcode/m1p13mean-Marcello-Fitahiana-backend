const express = require('express');
const {
  getDashboardStats,
  getYearlyRevenue
} = require('../controllers/dashboardController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('administrateur'));

router.get('/stats', getDashboardStats);
router.get('/revenue/:year', getYearlyRevenue);

module.exports = router;

