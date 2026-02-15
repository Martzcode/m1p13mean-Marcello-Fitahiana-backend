const express = require('express');
const {
  getPaiements,
  getPaiement,
  createPaiement,
  updatePaiement,
  deletePaiement,
  getPaiementsByCommercant
} = require('../controllers/paiementController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/commercant/:commercantId', authorize('administrateur'), getPaiementsByCommercant);

router.route('/')
  .get(getPaiements)
  .post(authorize('administrateur'), createPaiement);

router.route('/:id')
  .get(getPaiement)
  .put(authorize('administrateur'), updatePaiement)
  .delete(authorize('administrateur'), deletePaiement);

module.exports = router;

