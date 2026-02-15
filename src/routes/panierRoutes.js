const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMonPanier,
  ajouterProduit,
  modifierQuantite,
  retirerProduit,
  viderPanier,
  getTotalPanier
} = require('../controllers/panierController');

// Toutes les routes nécessitent authentification
router.use(protect);
router.use(authorize('client')); // Seuls les clients ont un panier

router.get('/', getMonPanier);
router.get('/total', getTotalPanier);
router.post('/ajouter', ajouterProduit);
router.put('/item/:produitId', modifierQuantite);
router.delete('/item/:produitId', retirerProduit);
router.delete('/', viderPanier);

module.exports = router;

