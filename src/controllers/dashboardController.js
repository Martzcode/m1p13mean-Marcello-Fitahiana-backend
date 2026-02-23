const Boutique = require('../models/Boutique');
const Loyer = require('../models/Loyer');
const Paiement = require('../models/Paiement');
const User = require('../models/User');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Boutiques stats
    const totalBoutiques = await Boutique.countDocuments();
    const boutiquesActives = await Boutique.countDocuments({ actif: true });
    const boutiquesOccupees = await Boutique.countDocuments({ statut: 'occupée' });

    // Loyers stats - calculer les retards correctement
    const loyersActifs = await Loyer.find({ statut: 'actif' });
    let totalLoyersMois = 0;
    let loyersPayesMois = 0;
    let loyersImpayes = [];
    let totalImpayes = 0;

    for (const loyer of loyersActifs) {
      totalLoyersMois += loyer.montant;

      // Vérifier tous les paiements impayés pour ce loyer
      const paiementsImpayes = await Paiement.find({
        loyer: loyer._id,
        statut: 'impayé'
      });

      if (paiementsImpayes.length > 0) {
        const moisEnRetard = paiementsImpayes.length;
        const montantDu = moisEnRetard * loyer.montant;
        totalImpayes += montantDu;

        const loyerWithDetails = await Loyer.findById(loyer._id)
          .populate('boutique')
          .populate('commercant', 'nom prenom email');

        loyersImpayes.push({
          loyer: loyerWithDetails,
          moisEnRetard,
          montantDu
        });
      } else {
        // Vérifier si le mois en cours est payé
        const paiementMoisCourant = await Paiement.findOne({
          loyer: loyer._id,
          mois: currentMonth,
          annee: currentYear
        });

        if (paiementMoisCourant && paiementMoisCourant.statut === 'payé') {
          loyersPayesMois += paiementMoisCourant.montant;
        }
      }
    }

    // Users stats
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalCommercants = await User.countDocuments({ role: 'commerçant' });

    // Produits stats
    const totalProduits = await Produit.countDocuments();
    const produitsActifs = await Produit.countDocuments({ actif: true });

    // Chiffre d'affaires annuel (loyers)
    const paiementsAnnee = await Paiement.find({ annee: currentYear });
    const chiffreAffairesAnnuel = paiementsAnnee.reduce((sum, p) => sum + p.montant, 0);

    // Évolution mensuelle du chiffre d'affaires
    const evolutionMensuelle = [];
    for (let mois = 1; mois <= 12; mois++) {
      const paiementsMois = await Paiement.find({
        mois: mois,
        annee: currentYear
      });
      const totalMois = paiementsMois.reduce((sum, p) => sum + p.montant, 0);
      evolutionMensuelle.push({
        mois,
        montant: totalMois
      });
    }

    res.status(200).json({
      success: true,
      data: {
        boutiques: {
          total: totalBoutiques,
          actives: boutiquesActives,
          occupees: boutiquesOccupees,
          libres: totalBoutiques - boutiquesOccupees
        },
        loyers: {
          totalMois: totalLoyersMois,
          payesMois: loyersPayesMois,
          impayesMois: totalImpayes,
          loyersImpayes: loyersImpayes,
          nombreImpayes: loyersImpayes.length
        },
        users: {
          clients: totalClients,
          commercants: totalCommercants
        },
        produits: {
          total: totalProduits,
          actifs: produitsActifs
        },
        chiffreAffaires: {
          annuel: chiffreAffairesAnnuel,
          evolutionMensuelle
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get merchant dashboard statistics
// @route   GET /api/v1/dashboard/merchant/stats
// @access  Private/Merchant
exports.getMerchantDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get merchant's loyers
    const loyers = await Loyer.find({ commercant: userId })
      .populate('boutique');

    const loyersActifs = loyers.filter(l => l.statut === 'actif');
    let totalLoyerMensuel = 0;
    let loyersImpayes = [];

    for (const loyer of loyersActifs) {
      totalLoyerMensuel += loyer.montant;

      const paiementsImpayes = await Paiement.find({
        loyer: loyer._id,
        statut: 'impayé'
      });

      if (paiementsImpayes.length > 0) {
        loyersImpayes.push({
          loyer,
          moisEnRetard: paiementsImpayes.length,
          montantDu: paiementsImpayes.length * loyer.montant
        });
      }
    }

    const totalImpayes = loyersImpayes.reduce((sum, l) => sum + l.montantDu, 0);

    // Get merchant's boutiques
    const boutiques = await Boutique.find({ commercant: userId });
    const boutiqueIds = boutiques.map(b => b._id);

    // Get products count
    const totalProduits = await Produit.countDocuments({ boutique: { $in: boutiqueIds } });
    const produitsActifs = await Produit.countDocuments({ boutique: { $in: boutiqueIds }, actif: true });

    // Get commandes count (current month)
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const commandesMois = await Commande.countDocuments({
      boutique: { $in: boutiqueIds },
      createdAt: { $gte: startOfMonth }
    });

    // Monthly revenue evolution (from commandes)
    const currentYear = currentDate.getFullYear();
    const evolutionCA = [];
    for (let mois = 1; mois <= 12; mois++) {
      const start = new Date(currentYear, mois - 1, 1);
      const end = new Date(currentYear, mois, 1);
      const commandes = await Commande.find({
        boutique: { $in: boutiqueIds },
        createdAt: { $gte: start, $lt: end }
      });
      const total = commandes.reduce((sum, c) => sum + (c.montantTotal || 0), 0);
      evolutionCA.push({ mois, montant: total });
    }

    res.status(200).json({
      success: true,
      data: {
        loyers: {
          totalMensuel: totalLoyerMensuel,
          loyersImpayes,
          totalImpayes,
          nombreActifs: loyersActifs.length
        },
        produits: {
          total: totalProduits,
          actifs: produitsActifs
        },
        commandes: {
          moisEnCours: commandesMois
        },
        boutiques: boutiques.length,
        evolutionCA
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get yearly revenue evolution
// @route   GET /api/v1/dashboard/revenue/:year
// @access  Private/Admin
exports.getYearlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();

    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const paiementsLoyers = await Paiement.find({
        mois: month,
        annee: year
      });
      const totalLoyers = paiementsLoyers.reduce((sum, p) => sum + p.montant, 0);

      monthlyData.push({
        mois: month,
        revenus: totalLoyers
      });
    }

    const totalAnnuel = monthlyData.reduce((sum, m) => sum + m.revenus, 0);

    res.status(200).json({
      success: true,
      data: {
        annee: year,
        totalAnnuel,
        monthlyData
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

