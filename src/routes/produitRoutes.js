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
router.post('/', protect, authorize('commercant', 'administrateur'), createProduit);
router.put('/:id', protect, authorize('commercant', 'administrateur'), updateProduit);
router.delete('/:id', protect, authorize('commercant', 'administrateur'), deleteProduit);
router.patch('/:id/toggle-actif', protect, authorize('commercant', 'administrateur'), toggleActif);
router.patch('/:id/stock', protect, authorize('commercant', 'administrateur'), updateStock);

module.exports = router;

