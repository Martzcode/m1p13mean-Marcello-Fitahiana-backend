const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProduits,
  getProduit,
  getProduitsByBoutique,
  createProduit,
  updateProduit,
  deleteProduit,
  toggleActif,
  updateStock
} = require('../controllers/produitController');

// Routes publiques
router.get('/', getProduits);
router.get('/:id', getProduit);

// Routes protégées (Commerçant + Admin)
router.post('/', protect, authorize('commerçant', 'administrateur'), createProduit);
router.put('/:id', protect, authorize('commerçant', 'administrateur'), updateProduit);
router.delete('/:id', protect, authorize('commerçant', 'administrateur'), deleteProduit);
router.patch('/:id/toggle-actif', protect, authorize('commerçant', 'administrateur'), toggleActif);
router.patch('/:id/stock', protect, authorize('commerçant', 'administrateur'), updateStock);

module.exports = router;

