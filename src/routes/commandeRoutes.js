const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCommande,
  getMesCommandes,
  getCommande,
  getCommandesBoutique,
  changerStatut,
  marquerPayee,
  getAllCommandes
} = require('../controllers/commandeController');

// Routes client
router.post('/', protect, authorize('client'), createCommande);
router.get('/mes-commandes', protect, authorize('client'), getMesCommandes);

// Routes admin
router.get('/admin/all', protect, authorize('administrateur'), getAllCommandes);

// Routes partagées (client peut voir ses commandes, commerçant ses commandes boutique)
router.get('/:id', protect, getCommande);

// Routes commerçant/admin
router.patch('/:id/statut', protect, authorize('commercant', 'administrateur'), changerStatut);
router.patch('/:id/paiement', protect, authorize('commercant', 'administrateur'), marquerPayee);

module.exports = router;

