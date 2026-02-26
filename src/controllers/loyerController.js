const Loyer = require('../models/Loyer');
const Paiement = require('../models/Paiement');
const Boutique = require('../models/Boutique');
const User = require('../models/User');

// @desc    Get all loyers
// @route   GET /api/v1/loyers
// @access  Private
exports.getLoyers = async (req, res) => {
  try {
    let query = {};

    // If user is commercant, only show their loyers
    if (req.user.role === 'commerçant') {
      query.commercant = req.user.id;
    }

    // Filter by statut
    if (req.query.statut) {
      query.statut = req.query.statut;
    }

    const loyers = await Loyer.find(query)
      .populate('boutique')
      .populate('commercant', 'nom prenom email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: loyers.length,
      data: loyers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single loyer
// @route   GET /api/v1/loyers/:id
// @access  Private
exports.getLoyer = async (req, res) => {
  try {
    const loyer = await Loyer.findById(req.params.id)
      .populate('boutique')
      .populate('commercant', 'nom prenom email telephone');

    if (!loyer) {
      return res.status(404).json({
        success: false,
        message: 'Loyer non trouvé'
      });
    }

    // Check authorization
    if (req.user.role === 'commerçant' && loyer.commercant._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      data: loyer
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create loyer
// @route   POST /api/v1/loyers
// @access  Private/Admin
exports.createLoyer = async (req, res) => {
  try {
    const { boutique, commercant, montant, periodicite, dateDebut, dateFin } = req.body;

    // Verify boutique exists
    const boutiqueDoc = await Boutique.findById(boutique);

    if (!boutiqueDoc) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // Verify commercant exists
    if (!commercant) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un commerçant'
      });
    }

    const commercantDoc = await User.findById(commercant);
    if (!commercantDoc || commercantDoc.role !== 'commerçant') {
      return res.status(400).json({
        success: false,
        message: 'Commerçant non trouvé ou invalide'
      });
    }

    const loyer = await Loyer.create({
      boutique,
      commercant,
      montant,
      periodicite,
      dateDebut,
      dateFin
    });

    // Mettre à jour le statut de la boutique → occupée
    await Boutique.findByIdAndUpdate(boutique, {
      statut: 'occupée',
      commercant: commercant
    });

    // Ajouter la boutique au commerçant si pas déjà présente
    await User.findByIdAndUpdate(commercant, {
      $addToSet: { boutiques: boutique }
    });

    res.status(201).json({
      success: true,
      data: loyer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update loyer
// @route   PUT /api/v1/loyers/:id
// @access  Private/Admin
exports.updateLoyer = async (req, res) => {
  try {
    // Récupérer l'ancien loyer pour comparer le statut
    const oldLoyer = await Loyer.findById(req.params.id);

    if (!oldLoyer) {
      return res.status(404).json({
        success: false,
        message: 'Loyer non trouvé'
      });
    }

    const loyer = await Loyer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Si le statut passe de actif → résilié/expiré, libérer la boutique
    if (oldLoyer.statut === 'actif' && req.body.statut && req.body.statut !== 'actif') {
      await Boutique.findByIdAndUpdate(oldLoyer.boutique, {
        statut: 'libre',
        $unset: { commercant: '' }
      });
      // Retirer la boutique du commerçant
      await User.findByIdAndUpdate(oldLoyer.commercant, {
        $pull: { boutiques: oldLoyer.boutique }
      });
    }

    // Si le statut passe de résilié/expiré → actif, occuper la boutique
    if (oldLoyer.statut !== 'actif' && req.body.statut === 'actif') {
      await Boutique.findByIdAndUpdate(oldLoyer.boutique, {
        statut: 'occupée',
        commercant: oldLoyer.commercant
      });
      await User.findByIdAndUpdate(oldLoyer.commercant, {
        $addToSet: { boutiques: oldLoyer.boutique }
      });
    }

    res.status(200).json({
      success: true,
      data: loyer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete loyer
// @route   DELETE /api/v1/loyers/:id
// @access  Private/Admin
exports.deleteLoyer = async (req, res) => {
  try {
    const loyer = await Loyer.findByIdAndDelete(req.params.id);

    if (!loyer) {
      return res.status(404).json({
        success: false,
        message: 'Loyer non trouvé'
      });
    }

    // Si le loyer supprimé était actif, libérer la boutique
    if (loyer.statut === 'actif') {
      await Boutique.findByIdAndUpdate(loyer.boutique, {
        statut: 'libre',
        $unset: { commercant: '' }
      });
      // Retirer la boutique du commerçant
      await User.findByIdAndUpdate(loyer.commercant, {
        $pull: { boutiques: loyer.boutique }
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

// @desc    Get loyers impayés (unpaid rents)
// @route   GET /api/v1/loyers/impayes
// @access  Private/Admin
exports.getLoyersImpayes = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get all active loyers
    const loyers = await Loyer.find({ statut: 'actif' })
      .populate('boutique')
      .populate('commercant', 'nom prenom email');

    const impayes = [];

    for (const loyer of loyers) {
      // Check if payment exists for current month
      const paiement = await Paiement.findOne({
        loyer: loyer._id,
        mois: currentMonth,
        annee: currentYear
      });

      if (!paiement) {
        impayes.push({
          loyer,
          mois: currentMonth,
          annee: currentYear
        });
      }
    }

    res.status(200).json({
      success: true,
      count: impayes.length,
      data: impayes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get total loyers for current month
// @route   GET /api/v1/loyers/stats/monthly
// @access  Private/Admin
exports.getMonthlyLoyersStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const loyers = await Loyer.find({ statut: 'actif' });

    let total = 0;
    let paye = 0;
    let impaye = 0;

    for (const loyer of loyers) {
      total += loyer.montant;

      const paiement = await Paiement.findOne({
        loyer: loyer._id,
        mois: currentMonth,
        annee: currentYear
      });

      if (paiement) {
        paye += paiement.montant;
      } else {
        impaye += loyer.montant;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        mois: currentMonth,
        annee: currentYear,
        total,
        paye,
        impaye
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

