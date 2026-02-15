const Zone = require('../models/Zone');
const Boutique = require('../models/Boutique');

// @desc    Get all zones
// @route   GET /api/v1/zones
// @access  Public
exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort('etage');

    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single zone
// @route   GET /api/v1/zones/:id
// @access  Public
exports.getZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone non trouvée'
      });
    }

    // Get boutiques in this zone
    const boutiques = await Boutique.find({ zone: zone._id });

    res.status(200).json({
      success: true,
      data: {
        zone,
        boutiques
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create zone
// @route   POST /api/v1/zones
// @access  Private/Admin
exports.createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);

    res.status(201).json({
      success: true,
      data: zone
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update zone
// @route   PUT /api/v1/zones/:id
// @access  Private/Admin
exports.updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: zone
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete zone
// @route   DELETE /api/v1/zones/:id
// @access  Private/Admin
exports.deleteZone = async (req, res) => {
  try {
    // Check if zone has boutiques
    const boutiquesCount = await Boutique.countDocuments({ zone: req.params.id });

    if (boutiquesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une zone contenant des boutiques'
      });
    }

    const zone = await Zone.findByIdAndDelete(req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone non trouvée'
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

