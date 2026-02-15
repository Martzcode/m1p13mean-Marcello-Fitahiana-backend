const express = require('express');
const {
  getLoyers,
  getLoyer,
  createLoyer,
  updateLoyer,
  deleteLoyer,
  getLoyersImpayes,
  getMonthlyLoyersStats
} = require('../controllers/loyerController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/impayes', authorize('administrateur'), getLoyersImpayes);
router.get('/stats/monthly', authorize('administrateur'), getMonthlyLoyersStats);

router.route('/')
  .get(getLoyers)
  .post(authorize('administrateur'), createLoyer);

router.route('/:id')
  .get(getLoyer)
  .put(authorize('administrateur'), updateLoyer)
  .delete(authorize('administrateur'), deleteLoyer);

module.exports = router;

