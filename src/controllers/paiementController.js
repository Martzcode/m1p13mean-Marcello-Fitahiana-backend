const Paiement = require('../models/Paiement');
const Loyer = require('../models/Loyer');

// @desc    Get all paiements
// @route   GET /api/v1/paiements
// @access  Private
exports.getPaiements = async (req, res) => {
  try {
    let query = {};

    // If user is commercant, only show their paiements
    if (req.user.role === 'commerçant') {
      query.commercant = req.user.id;
    }

    // Filter by year
    if (req.query.annee) {
      query.annee = parseInt(req.query.annee);
    }

    // Filter by month
    if (req.query.mois) {
      query.mois = parseInt(req.query.mois);
    }

    const paiements = await Paiement.find(query)
      .populate({
        path: 'loyer',
        populate: { path: 'boutique' }
      })
      .populate('commercant', 'nom prenom email')
      .sort('-datePaiement');

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

// @desc    Get single paiement
// @route   GET /api/v1/paiements/:id
// @access  Private
exports.getPaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id)
      .populate({
        path: 'loyer',
        populate: { path: 'boutique' }
      })
      .populate('commercant', 'nom prenom email telephone');

    if (!paiement) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Check authorization
    if (req.user.role === 'commerçant' && paiement.commercant._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      data: paiement
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create paiement
// @route   POST /api/v1/paiements
// @access  Private/Admin
exports.createPaiement = async (req, res) => {
  try {
    const { loyer, montant, mois, annee, methodePaiement, reference } = req.body;

    // Verify loyer exists
    const loyerDoc = await Loyer.findById(loyer);

    if (!loyerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Loyer non trouvé'
      });
    }

    // Create paiement
    const paiement = await Paiement.create({
      loyer,
      commercant: loyerDoc.commercant,
      montant,
      mois,
      annee,
      methodePaiement,
      reference,
      statut: 'payé'
    });

    res.status(201).json({
      success: true,
      data: paiement
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update paiement
// @route   PUT /api/v1/paiements/:id
// @access  Private/Admin
exports.updatePaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!paiement) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: paiement
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete paiement
// @route   DELETE /api/v1/paiements/:id
// @access  Private/Admin
exports.deletePaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndDelete(req.params.id);

    if (!paiement) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get paiements by commercant
// @route   GET /api/v1/paiements/commercant/:commercantId
// @access  Private/Admin
exports.getPaiementsByCommercant = async (req, res) => {
  try {
    const paiements = await Paiement.find({ commercant: req.params.commercantId })
      .populate({
        path: 'loyer',
        populate: { path: 'boutique' }
      })
      .sort('-datePaiement');

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

