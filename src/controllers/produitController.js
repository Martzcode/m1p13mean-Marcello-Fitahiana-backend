const Produit = require('../models/Produit');
const Boutique = require('../models/Boutique');

// @desc    Obtenir tous les produits
// @route   GET /api/v1/produits
// @access  Public
exports.getProduits = async (req, res) => {
  try {
    const { boutique, categorie, actif, search } = req.query;

    // Build query
    let query = {};
    if (boutique) query.boutique = boutique;
    if (categorie) query.categorie = categorie;
    if (actif !== undefined) query.actif = actif === 'true';
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const produits = await Produit.find(query)
      .populate('boutique', 'nom numero zone')
      .populate({
        path: 'boutique',
        populate: { path: 'zone', select: 'nom etage' }
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Produit.countDocuments(query);

    res.status(200).json({
      success: true,
      count: produits.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: produits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// @desc    Obtenir un produit par ID
// @route   GET /api/v1/produits/:id
// @access  Public
exports.getProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id)
      .populate('boutique', 'nom numero zone categorie')
      .populate({
        path: 'boutique',
        populate: { path: 'zone', select: 'nom etage' }
      });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: produit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// @desc    Obtenir produits d'une boutique
// @route   GET /api/v1/boutiques/:boutiqueId/produits
// @access  Public
exports.getProduitsByBoutique = async (req, res) => {
  try {
    const { actif, categorie } = req.query;

    let query = { boutique: req.params.boutiqueId };
    if (actif !== undefined) query.actif = actif === 'true';
    if (categorie) query.categorie = categorie;

    const produits = await Produit.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: produits.length,
      data: produits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// @desc    Créer un produit
// @route   POST /api/v1/produits
// @access  Private (Commerçant)
exports.createProduit = async (req, res) => {
  try {
    const { nom, description, prix, stock, images, categorie, boutique } = req.body;

    // Vérifier que la boutique existe
    const boutiqueExists = await Boutique.findById(boutique);
    if (!boutiqueExists) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // Vérifier que le commerçant est propriétaire de la boutique (sauf admin)
    if (req.user.role === 'commercant') {
      const isOwner = boutiqueExists.commercant &&
                     boutiqueExists.commercant.toString() === req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à créer un produit pour cette boutique'
        });
      }
    }

    const produit = await Produit.create({
      nom,
      description,
      prix,
      stock,
      images: images || [],
      categorie,
      boutique
    });

    const produitPopulated = await Produit.findById(produit._id)
      .populate('boutique', 'nom numero');

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: produitPopulated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// @desc    Modifier un produit
// @route   PUT /api/v1/produits/:id
// @access  Private (Commerçant)
exports.updateProduit = async (req, res) => {
  try {
    let produit = await Produit.findById(req.params.id).populate('boutique');

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier ownership (sauf admin)
    if (req.user.role === 'commercant') {
      const isOwner = produit.boutique.commercant &&
                     produit.boutique.commercant.toString() === req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier ce produit'
        });
      }
    }

    const { nom, description, prix, stock, images, categorie, actif } = req.body;

    produit = await Produit.findByIdAndUpdate(
      req.params.id,
      { nom, description, prix, stock, images, categorie, actif },
      { new: true, runValidators: true }
    ).populate('boutique', 'nom numero');

    res.status(200).json({
      success: true,
      message: 'Produit modifié avec succès',
      data: produit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la modification du produit',
      error: error.message
    });
  }
};

// @desc    Supprimer un produit
// @route   DELETE /api/v1/produits/:id
// @access  Private (Commerçant)
exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id).populate('boutique');

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier ownership (sauf admin)
    if (req.user.role === 'commercant') {
      const isOwner = produit.boutique.commercant &&
                     produit.boutique.commercant.toString() === req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à supprimer ce produit'
        });
      }
    }

    await produit.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message
    });
  }
};

// @desc    Activer/Désactiver un produit
// @route   PATCH /api/v1/produits/:id/toggle-actif
// @access  Private (Commerçant)
exports.toggleActif = async (req, res) => {
  try {
    let produit = await Produit.findById(req.params.id).populate('boutique');

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier ownership (sauf admin)
    if (req.user.role === 'commercant') {
      const isOwner = produit.boutique.commercant &&
                     produit.boutique.commercant.toString() === req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier ce produit'
        });
      }
    }

    produit.actif = !produit.actif;
    await produit.save();

    res.status(200).json({
      success: true,
      message: `Produit ${produit.actif ? 'activé' : 'désactivé'} avec succès`,
      data: produit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du produit',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le stock
// @route   PATCH /api/v1/produits/:id/stock
// @access  Private (Commerçant)
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock invalide'
      });
    }

    let produit = await Produit.findById(req.params.id).populate('boutique');

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier ownership (sauf admin)
    if (req.user.role === 'commercant') {
      const isOwner = produit.boutique.commercant &&
                     produit.boutique.commercant.toString() === req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier ce produit'
        });
      }
    }

    produit.stock = stock;
    await produit.save();

    res.status(200).json({
      success: true,
      message: 'Stock mis à jour avec succès',
      data: produit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du stock',
      error: error.message
    });
  }
};

