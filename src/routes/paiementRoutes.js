const express = require('express');
const {
  getPaiements,
  getPaiement,
  createPaiement,
  updatePaiement,
  deletePaiement,
  getPaiementsByCommercant,
  getMoisPayes
} = require('../controllers/paiementController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/loyer/:loyerId/mois-payes', authorize('administrateur'), getMoisPayes);
router.get('/commercant/:commercantId', authorize('administrateur'), getPaiementsByCommercant);

router.route('/')
  .get(getPaiements)
  .post(authorize('administrateur'), createPaiement);

router.route('/:id')
  .get(getPaiement)
  .put(authorize('administrateur'), updatePaiement)
  .delete(authorize('administrateur'), deletePaiement);

module.exports = router;

