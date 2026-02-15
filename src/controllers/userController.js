const User = require('../models/User');
const Boutique = require('../models/Boutique');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('boutiques');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('boutiques');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
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

// @desc    Get commercants (merchants)
// @route   GET /api/v1/users/commercants
// @access  Private/Admin
exports.getCommercants = async (req, res) => {
  try {
    const commercants = await User.find({ role: 'commerçant' }).populate('boutiques');

    res.status(200).json({
      success: true,
      count: commercants.length,
      data: commercants
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Assign boutique to commercant
// @route   POST /api/v1/users/:userId/boutiques/:boutiqueId
// @access  Private/Admin
exports.assignBoutique = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const boutique = await Boutique.findById(req.params.boutiqueId);

    if (!user || !boutique) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur ou boutique non trouvé'
      });
    }

    if (user.role !== 'commerçant') {
      return res.status(400).json({
        success: false,
        message: 'L\'utilisateur doit être un commerçant'
      });
    }

    // Add boutique to user
    if (!user.boutiques.includes(boutique._id)) {
      user.boutiques.push(boutique._id);
      await user.save();
    }

    // Update boutique
    boutique.commercant = user._id;
    boutique.statut = 'occupée';
    await boutique.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

