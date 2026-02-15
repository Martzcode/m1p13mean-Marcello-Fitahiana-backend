const express = require('express');
const {
  getBoutiques,
  getBoutique,
  createBoutique,
  updateBoutique,
  deleteBoutique,
  getBoutiquesStats
} = require('../controllers/boutiqueController');

const {
  getBoutiqueHistorique,
  getBoutiquePaiements,
  getBoutiqueOccupants
} = require('../controllers/historiqueController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getBoutiques)
  .post(protect, authorize('administrateur'), createBoutique);

router.get('/stats', protect, authorize('administrateur'), getBoutiquesStats);

// Historique routes
router.get('/:id/historique', protect, authorize('administrateur'), getBoutiqueHistorique);
router.get('/:id/paiements', protect, authorize('administrateur'), getBoutiquePaiements);
router.get('/:id/occupants', protect, authorize('administrateur'), getBoutiqueOccupants);

// Produits et commandes routes
router.get('/:boutiqueId/produits', getProduitsByBoutique);
router.get('/:boutiqueId/commandes', protect, authorize('commercant', 'administrateur'), getCommandesBoutique);

router.route('/:id')
  .get(getBoutique)
  .put(protect, authorize('administrateur'), updateBoutique)
  .delete(protect, authorize('administrateur'), deleteBoutique);

module.exports = router;

