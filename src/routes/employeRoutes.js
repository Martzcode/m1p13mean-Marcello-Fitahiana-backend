const express = require('express');
const {
  getEmployes,
  getEmploye,
  createEmploye,
  updateEmploye,
  deleteEmploye,
  getEmployePaiements,
  createSalairePaiement,
  getSalairesStats
} = require('../controllers/employeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('administrateur'));

router.get('/stats/salaires', getSalairesStats);

router.route('/')
  .get(getEmployes)
  .post(createEmploye);

router.route('/:id')
  .get(getEmploye)
  .put(updateEmploye)
  .delete(deleteEmploye);

router.route('/:id/paiements')
  .get(getEmployePaiements)
  .post(createSalairePaiement);

module.exports = router;

