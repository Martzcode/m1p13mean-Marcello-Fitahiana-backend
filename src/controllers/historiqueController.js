const Boutique = require('../models/Boutique');
const Loyer = require('../models/Loyer');
const Paiement = require('../models/Paiement');

// @desc    Get complete history of a boutique
// @route   GET /api/v1/boutiques/:id/historique
// @access  Private/Admin
exports.getBoutiqueHistorique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('zone')
      .populate('commercant', 'nom prenom email telephone');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // Get all loyers for this boutique (current + past)
    const loyers = await Loyer.find({ boutique: req.params.id })
      .populate('commercant', 'nom prenom email telephone')
      .sort('-createdAt');

    // Get all paiements for this boutique
    const paiements = await Paiement.find()
      .populate({
        path: 'loyer',
        match: { boutique: req.params.id },
        populate: { path: 'commercant', select: 'nom prenom email' }
      })
      .sort({ annee: -1, mois: -1 });

    // Filter out null loyers (from populate match)
    const boutiquePaiements = paiements.filter(p => p.loyer !== null);

    // Calculate statistics
    const totalPaiements = boutiquePaiements.reduce((sum, p) => sum + p.montant, 0);
    const nombrePaiements = boutiquePaiements.length;

    // Get occupants history (unique commercants)
    const occupants = [];
    const commercantIds = new Set();

    for (const loyer of loyers) {
      if (loyer.commercant && !commercantIds.has(loyer.commercant._id.toString())) {
        commercantIds.add(loyer.commercant._id.toString());
        occupants.push({
          commercant: loyer.commercant,
          dateDebut: loyer.dateDebut,
          dateFin: loyer.dateFin,
          montant: loyer.montant,
          statut: loyer.statut
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        boutique: {
          ...boutique.toObject(),
          loyerActuel: boutique.statut === 'occupée' ?
            loyers.find(l => l.statut === 'actif')?.montant : null
        },
        loyers: loyers,
        paiements: boutiquePaiements,
        occupants: occupants,
        statistiques: {
          totalPaiements: totalPaiements,
          nombrePaiements: nombrePaiements,
          moyennePaiement: nombrePaiements > 0 ? totalPaiements / nombrePaiements : 0,
          nombreOccupants: occupants.length
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get paiements for a specific boutique
// @route   GET /api/v1/boutiques/:id/paiements
// @access  Private/Admin
exports.getBoutiquePaiements = async (req, res) => {
  try {
    // Get all loyers for this boutique
    const loyers = await Loyer.find({ boutique: req.params.id });
    const loyerIds = loyers.map(l => l._id);

    // Get all paiements for these loyers
    const paiements = await Paiement.find({ loyer: { $in: loyerIds } })
      .populate({
        path: 'loyer',
        populate: { path: 'commercant', select: 'nom prenom email' }
      })
      .sort({ annee: -1, mois: -1 });

    res.status(200).json({
      success: true,
      count: paiements.length,
      data: paiements
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get occupants history for a boutique
// @route   GET /api/v1/boutiques/:id/occupants
// @access  Private/Admin
exports.getBoutiqueOccupants = async (req, res) => {
  try {
    const loyers = await Loyer.find({ boutique: req.params.id })
      .populate('commercant', 'nom prenom email telephone photo')
      .sort('-dateDebut');

    const occupants = loyers.map(loyer => ({
      commercant: loyer.commercant,
      dateDebut: loyer.dateDebut,
      dateFin: loyer.dateFin,
      montant: loyer.montant,
      periodicite: loyer.periodicite,
      statut: loyer.statut,
      duree: loyer.dateFin ?
        Math.ceil((new Date(loyer.dateFin) - new Date(loyer.dateDebut)) / (1000 * 60 * 60 * 24 * 30)) :
        'En cours'
    }));

    res.status(200).json({
      success: true,
      count: occupants.length,
      data: occupants
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


