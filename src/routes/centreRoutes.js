const express = require('express');
const {
  getCentre,
  createOrUpdateCentre
} = require('../controllers/centreController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getCentre)
  .post(protect, authorize('administrateur'), createOrUpdateCentre);

module.exports = router;

