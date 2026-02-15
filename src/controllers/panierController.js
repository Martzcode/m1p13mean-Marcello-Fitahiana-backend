const Panier = require('../models/Panier');
const Produit = require('../models/Produit');

// @desc    Obtenir mon panier
// @route   GET /api/v1/panier
// @access  Private (Client)
exports.getMonPanier = async (req, res) => {
  try {
    let panier = await Panier.findOne({ client: req.user._id })
      .populate({
        path: 'items.produit',
        select: 'nom prix stock images actif boutique',
        populate: { path: 'boutique', select: 'nom' }
      });

    if (!panier) {
      // Créer un panier vide si n'existe pas
      panier = await Panier.create({ client: req.user._id, items: [] });
    }

    // Filtrer les produits supprimés ou inactifs
    panier.items = panier.items.filter(item => item.produit && item.produit.actif);
    await panier.save();

    res.status(200).json({
      success: true,
      data: panier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du panier',
      error: error.message
    });
  }
};

// @desc    Ajouter un produit au panier
// @route   POST /api/v1/panier/ajouter
// @access  Private (Client)
exports.ajouterProduit = async (req, res) => {
  try {
    const { produitId, quantite } = req.body;

    if (!produitId || !quantite || quantite < 1) {
      return res.status(400).json({
        success: false,
        message: 'Produit et quantité requis'
      });
    }

    // Vérifier que le produit existe et est actif
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    if (!produit.actif) {
      return res.status(400).json({
        success: false,
        message: 'Ce produit n\'est plus disponible'
      });
    }

    // Vérifier le stock
    if (produit.stock < quantite) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant. Stock disponible: ${produit.stock}`
      });
    }

    // Trouver ou créer le panier
    let panier = await Panier.findOne({ client: req.user._id });
    if (!panier) {
      panier = new Panier({ client: req.user._id, items: [] });
    }

    // Vérifier si le produit est déjà dans le panier
    const itemIndex = panier.items.findIndex(
      item => item.produit.toString() === produitId
    );

    if (itemIndex > -1) {
      // Produit existe, additionner les quantités
      const nouvelleQuantite = panier.items[itemIndex].quantite + quantite;

      // Vérifier stock pour nouvelle quantité
      if (produit.stock < nouvelleQuantite) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant. Stock disponible: ${produit.stock}, déjà dans panier: ${panier.items[itemIndex].quantite}`
        });
      }

      panier.items[itemIndex].quantite = nouvelleQuantite;
      panier.items[itemIndex].prix = produit.prix; // Mettre à jour le prix
    } else {
      // Nouveau produit
      panier.items.push({
        produit: produitId,
        quantite,
        prix: produit.prix
      });
    }

    await panier.save();

    // Repopulate pour retourner les infos complètes
    panier = await Panier.findById(panier._id)
      .populate({
        path: 'items.produit',
        select: 'nom prix stock images boutique',
        populate: { path: 'boutique', select: 'nom' }
      });

    res.status(200).json({
      success: true,
      message: 'Produit ajouté au panier',
      data: panier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout au panier',
      error: error.message
    });
  }
};

// @desc    Modifier la quantité d'un produit dans le panier
// @route   PUT /api/v1/panier/item/:produitId
// @access  Private (Client)
exports.modifierQuantite = async (req, res) => {
  try {
    const { quantite } = req.body;

    if (!quantite || quantite < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantité invalide'
      });
    }

    const panier = await Panier.findOne({ client: req.user._id });
    if (!panier) {
      return res.status(404).json({
        success: false,
        message: 'Panier non trouvé'
      });
    }

    const itemIndex = panier.items.findIndex(
      item => item.produit.toString() === req.params.produitId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé dans le panier'
      });
    }

    // Vérifier le stock
    const produit = await Produit.findById(req.params.produitId);
    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    if (produit.stock < quantite) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant. Stock disponible: ${produit.stock}`
      });
    }

    panier.items[itemIndex].quantite = quantite;
    panier.items[itemIndex].prix = produit.prix; // Mettre à jour le prix

    await panier.save();

    // Repopulate
    const panierPopulated = await Panier.findById(panier._id)
      .populate({
        path: 'items.produit',
        select: 'nom prix stock images boutique',
        populate: { path: 'boutique', select: 'nom' }
      });

    res.status(200).json({
      success: true,
      message: 'Quantité mise à jour',
      data: panierPopulated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification',
      error: error.message
    });
  }
};

// @desc    Retirer un produit du panier
// @route   DELETE /api/v1/panier/item/:produitId
// @access  Private (Client)
exports.retirerProduit = async (req, res) => {
  try {
    const panier = await Panier.findOne({ client: req.user._id });
    if (!panier) {
      return res.status(404).json({
        success: false,
        message: 'Panier non trouvé'
      });
    }

    panier.items = panier.items.filter(
      item => item.produit.toString() !== req.params.produitId
    );

    await panier.save();

    // Repopulate
    const panierPopulated = await Panier.findById(panier._id)
      .populate({
        path: 'items.produit',
        select: 'nom prix stock images boutique',
        populate: { path: 'boutique', select: 'nom' }
      });

    res.status(200).json({
      success: true,
      message: 'Produit retiré du panier',
      data: panierPopulated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// @desc    Vider le panier
// @route   DELETE /api/v1/panier
// @access  Private (Client)
exports.viderPanier = async (req, res) => {
  try {
    const panier = await Panier.findOne({ client: req.user._id });
    if (!panier) {
      return res.status(404).json({
        success: false,
        message: 'Panier non trouvé'
      });
    }

    panier.items = [];
    panier.montantTotal = 0;
    await panier.save();

    res.status(200).json({
      success: true,
      message: 'Panier vidé',
      data: panier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du vidage du panier',
      error: error.message
    });
  }
};

// @desc    Obtenir le total du panier
// @route   GET /api/v1/panier/total
// @access  Private (Client)
exports.getTotalPanier = async (req, res) => {
  try {
    const panier = await Panier.findOne({ client: req.user._id });

    const total = panier ? panier.montantTotal : 0;
    const nombreItems = panier ? panier.items.length : 0;

    res.status(200).json({
      success: true,
      data: {
        montantTotal: total,
        nombreItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du total',
      error: error.message
    });
  }
};

