const express = require('express');
const {
  getZones,
  getZone,
  createZone,
  updateZone,
  deleteZone
} = require('../controllers/zoneController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getZones)
  .post(protect, authorize('administrateur'), createZone);

router.route('/:id')
  .get(getZone)
  .put(protect, authorize('administrateur'), updateZone)
  .delete(protect, authorize('administrateur'), deleteZone);

module.exports = router;

