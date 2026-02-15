const Employe = require('../models/Employe');
const SalairePaiement = require('../models/SalairePaiement');

// @desc    Get all employes
// @route   GET /api/v1/employes
// @access  Private/Admin
exports.getEmployes = async (req, res) => {
  try {
    let query = {};

    if (req.query.actif !== undefined) {
      query.actif = req.query.actif === 'true';
    }

    if (req.query.fonction) {
      query.fonction = req.query.fonction;
    }

    const employes = await Employe.find(query).sort('nom');

    res.status(200).json({
      success: true,
      count: employes.length,
      data: employes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single employe
// @route   GET /api/v1/employes/:id
// @access  Private/Admin
exports.getEmploye = async (req, res) => {
  try {
    const employe = await Employe.findById(req.params.id);

    if (!employe) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: employe
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create employe
// @route   POST /api/v1/employes
// @access  Private/Admin
exports.createEmploye = async (req, res) => {
  try {
    const employe = await Employe.create(req.body);

    res.status(201).json({
      success: true,
      data: employe
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update employe
// @route   PUT /api/v1/employes/:id
// @access  Private/Admin
exports.updateEmploye = async (req, res) => {
  try {
    const employe = await Employe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!employe) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: employe
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete employe
// @route   DELETE /api/v1/employes/:id
// @access  Private/Admin
exports.deleteEmploye = async (req, res) => {
  try {
    const employe = await Employe.findByIdAndDelete(req.params.id);

    if (!employe) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
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

// @desc    Get salaire paiements for employe
// @route   GET /api/v1/employes/:id/paiements
// @access  Private/Admin
exports.getEmployePaiements = async (req, res) => {
  try {
    const paiements = await SalairePaiement.find({ employe: req.params.id })
      .populate('employe')
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

// @desc    Create salaire paiement
// @route   POST /api/v1/employes/:id/paiements
// @access  Private/Admin
exports.createSalairePaiement = async (req, res) => {
  try {
    const employe = await Employe.findById(req.params.id);

    if (!employe) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const { montant, mois, annee, methodePaiement } = req.body;

    const paiement = await SalairePaiement.create({
      employe: req.params.id,
      montant: montant || employe.salaire,
      mois,
      annee,
      methodePaiement
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

// @desc    Get total salaires for month
// @route   GET /api/v1/employes/stats/salaires
// @access  Private/Admin
exports.getSalairesStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const mois = req.query.mois || currentDate.getMonth() + 1;
    const annee = req.query.annee || currentDate.getFullYear();

    const paiements = await SalairePaiement.find({
      mois: parseInt(mois),
      annee: parseInt(annee)
    });

    const total = paiements.reduce((sum, p) => sum + p.montant, 0);

    res.status(200).json({
      success: true,
      data: {
        mois: parseInt(mois),
        annee: parseInt(annee),
        total,
        count: paiements.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

