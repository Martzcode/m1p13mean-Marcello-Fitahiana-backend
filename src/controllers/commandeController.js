const Commande = require('../models/Commande');
const Panier = require('../models/Panier');
const Produit = require('../models/Produit');
const mongoose = require('mongoose');

// @desc    Créer une commande depuis le panier
// @route   POST /api/v1/commandes
// @access  Private (Client)
exports.createCommande = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { modePaiement, notes } = req.body;

    if (!modePaiement || !['livraison', 'en_ligne'].includes(modePaiement)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Mode de paiement invalide'
      });
    }

    // Récupérer le panier
    const panier = await Panier.findOne({ client: req.user._id })
      .populate('items.produit')
      .session(session);

    if (!panier || panier.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Le panier est vide'
      });
    }

    // Grouper les produits par boutique
    const commandesParBoutique = {};

    for (const item of panier.items) {
      if (!item.produit || !item.produit.actif) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Le produit ${item.produit?.nom || 'inconnu'} n'est plus disponible`
        });
      }

      // Vérifier le stock
      if (item.produit.stock < item.quantite) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${item.produit.nom}. Stock disponible: ${item.produit.stock}`
        });
      }

      const boutiqueId = item.produit.boutique.toString();

      if (!commandesParBoutique[boutiqueId]) {
        commandesParBoutique[boutiqueId] = [];
      }

      commandesParBoutique[boutiqueId].push({
        produit: item.produit._id,
        nom: item.produit.nom,
        prix: item.produit.prix, // Prix actuel du produit
        quantite: item.quantite,
        sousTotal: item.produit.prix * item.quantite
      });
    }

    // Créer une commande par boutique
    const commandesCreees = [];

    for (const [boutiqueId, produits] of Object.entries(commandesParBoutique)) {
      const montantTotal = produits.reduce((sum, p) => sum + p.sousTotal, 0);

      const commande = await Commande.create([{
        client: req.user._id,
        boutique: boutiqueId,
        produits,
        montantTotal,
        modePaiement,
        paye: modePaiement === 'en_ligne', // Si paiement en ligne, considéré payé
        notes
      }], { session });

      commandesCreees.push(commande[0]);

      // Décrémenter les stocks
      for (const produit of produits) {
        await Produit.findByIdAndUpdate(
          produit.produit,
          { $inc: { stock: -produit.quantite } },
          { session }
        );
      }
    }

    // Vider le panier
    panier.items = [];
    panier.montantTotal = 0;
    await panier.save({ session });

    await session.commitTransaction();

    // Populate les commandes pour retour
    const commandesPopulated = await Commande.find({
      _id: { $in: commandesCreees.map(c => c._id) }
    })
    .populate('boutique', 'nom numero')
    .populate('client', 'nom email');

    res.status(201).json({
      success: true,
      message: 'Commande(s) créée(s) avec succès',
      count: commandesCreees.length,
      data: commandesPopulated
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Obtenir mes commandes (client)
// @route   GET /api/v1/commandes/mes-commandes
// @access  Private (Client)
exports.getMesCommandes = async (req, res) => {
  try {
    const { statut } = req.query;

    let query = { client: req.user._id };
    if (statut) query.statut = statut;

    const commandes = await Commande.find(query)
      .populate('boutique', 'nom numero')
      .populate('produits.produit', 'nom images')
      .sort('-dateCommande');

    res.status(200).json({
      success: true,
      count: commandes.length,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message
    });
  }
};

// @desc    Obtenir une commande par ID
// @route   GET /api/v1/commandes/:id
// @access  Private (Client/Commerçant)
exports.getCommande = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id)
      .populate('client', 'nom email telephone')
      .populate('boutique', 'nom numero')
      .populate('produits.produit', 'nom images');

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier les permissions
    const isClient = commande.client._id.toString() === req.user._id.toString();
    const isCommercant = req.user.role === 'commercant'; // TODO: Vérifier ownership boutique
    const isAdmin = req.user.role === 'administrateur';

    if (!isClient && !isCommercant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      data: commande
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande',
      error: error.message
    });
  }
};

// @desc    Obtenir commandes d'une boutique
// @route   GET /api/v1/boutiques/:boutiqueId/commandes
// @access  Private (Commerçant/Admin)
exports.getCommandesBoutique = async (req, res) => {
  try {
    const { statut, dateDebut, dateFin } = req.query;

    let query = { boutique: req.params.boutiqueId };
    if (statut) query.statut = statut;
    if (dateDebut || dateFin) {
      query.dateCommande = {};
      if (dateDebut) query.dateCommande.$gte = new Date(dateDebut);
      if (dateFin) query.dateCommande.$lte = new Date(dateFin);
    }

    const commandes = await Commande.find(query)
      .populate('client', 'nom email telephone')
      .populate('produits.produit', 'nom')
      .sort('-dateCommande');

    res.status(200).json({
      success: true,
      count: commandes.length,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message
    });
  }
};

// @desc    Changer le statut d'une commande
// @route   PATCH /api/v1/commandes/:id/statut
// @access  Private (Commerçant/Admin)
exports.changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;

    const statutsValides = ['nouvelle', 'confirmee', 'en_preparation', 'prete', 'livree', 'annulee'];
    if (!statut || !statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    let commande = await Commande.findById(req.params.id);

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // TODO: Vérifier ownership boutique si commerçant

    commande.statut = statut;

    // Si livré, mettre date livraison
    if (statut === 'livree' && !commande.dateLivraison) {
      commande.dateLivraison = new Date();
    }

    await commande.save();

    commande = await Commande.findById(commande._id)
      .populate('boutique', 'nom')
      .populate('client', 'nom email');

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      data: commande
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
};

// @desc    Marquer une commande comme payée
// @route   PATCH /api/v1/commandes/:id/paiement
// @access  Private (Commerçant/Admin)
exports.marquerPayee = async (req, res) => {
  try {
    let commande = await Commande.findById(req.params.id);

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // TODO: Vérifier ownership boutique si commerçant

    commande.paye = true;
    await commande.save();

    res.status(200).json({
      success: true,
      message: 'Commande marquée comme payée',
      data: commande
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Obtenir toutes les commandes (Admin)
// @route   GET /api/v1/admin/commandes
// @access  Private (Admin)
exports.getAllCommandes = async (req, res) => {
  try {
    const { statut, boutique, dateDebut, dateFin } = req.query;

    let query = {};
    if (statut) query.statut = statut;
    if (boutique) query.boutique = boutique;
    if (dateDebut || dateFin) {
      query.dateCommande = {};
      if (dateDebut) query.dateCommande.$gte = new Date(dateDebut);
      if (dateFin) query.dateCommande.$lte = new Date(dateFin);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const commandes = await Commande.find(query)
      .populate('client', 'nom email')
      .populate('boutique', 'nom numero')
      .sort('-dateCommande')
      .skip(skip)
      .limit(limit);

    const total = await Commande.countDocuments(query);

    res.status(200).json({
      success: true,
      count: commandes.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message
    });
  }
};

