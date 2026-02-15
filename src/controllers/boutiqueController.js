const Boutique = require('../models/Boutique');
const Zone = require('../models/Zone');

// @desc    Get all boutiques
// @route   GET /api/v1/boutiques
// @access  Public
exports.getBoutiques = async (req, res) => {
  try {
    let query = {};

    // Filter by zone
    if (req.query.zone) {
      query.zone = req.query.zone;
    }

    // Filter by statut
    if (req.query.statut) {
      query.statut = req.query.statut;
    }

    // Filter by categorie
    if (req.query.categorie) {
      query.categorie = req.query.categorie;
    }

    // Filter by actif
    if (req.query.actif !== undefined) {
      query.actif = req.query.actif === 'true';
    }

    const boutiques = await Boutique.find(query)
      .populate('zone')
      .populate('commercant', 'nom prenom email telephone');

    res.status(200).json({
      success: true,
      count: boutiques.length,
      data: boutiques
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single boutique
// @route   GET /api/v1/boutiques/:id
// @access  Public
exports.getBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('zone')
      .populate('commercant', 'nom prenom email telephone photo');

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: boutique
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create boutique
// @route   POST /api/v1/boutiques
// @access  Private/Admin
exports.createBoutique = async (req, res) => {
  try {
    // Verify zone exists
    const zone = await Zone.findById(req.body.zone);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone non trouvée'
      });
    }

    const boutique = await Boutique.create(req.body);

    res.status(201).json({
      success: true,
      data: boutique
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update boutique
// @route   PUT /api/v1/boutiques/:id
// @access  Private/Admin
exports.updateBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: boutique
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete boutique
// @route   DELETE /api/v1/boutiques/:id
// @access  Private/Admin
exports.deleteBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndDelete(req.params.id);

    if (!boutique) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
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

// @desc    Get boutiques statistics
// @route   GET /api/v1/boutiques/stats
// @access  Private/Admin
exports.getBoutiquesStats = async (req, res) => {
  try {
    const total = await Boutique.countDocuments();
    const actives = await Boutique.countDocuments({ actif: true });
    const occupees = await Boutique.countDocuments({ statut: 'occupée' });
    const libres = await Boutique.countDocuments({ statut: 'libre' });

    res.status(200).json({
      success: true,
      data: {
        total,
        actives,
        occupees,
        libres
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

