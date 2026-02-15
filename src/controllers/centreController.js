const CentreCommercial = require('../models/CentreCommercial');

// @desc    Get centre commercial info
// @route   GET /api/v1/centre
// @access  Public
exports.getCentre = async (req, res) => {
  try {
    const centre = await CentreCommercial.findOne();

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centre commercial non configuré'
      });
    }

    res.status(200).json({
      success: true,
      data: centre
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create or update centre commercial
// @route   POST /api/v1/centre
// @access  Private/Admin
exports.createOrUpdateCentre = async (req, res) => {
  try {
    let centre = await CentreCommercial.findOne();

    if (centre) {
      centre = await CentreCommercial.findByIdAndUpdate(centre._id, req.body, {
        new: true,
        runValidators: true
      });
    } else {
      centre = await CentreCommercial.create(req.body);
    }

    res.status(200).json({
      success: true,
      data: centre
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

