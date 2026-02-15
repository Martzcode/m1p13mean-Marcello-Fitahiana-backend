const Boutique = require('../models/Boutique');
const Loyer = require('../models/Loyer');
const Paiement = require('../models/Paiement');
const User = require('../models/User');
const SalairePaiement = require('../models/SalairePaiement');

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

// @desc    Get yearly revenue evolution
// @route   GET /api/v1/dashboard/revenue/:year
// @access  Private/Admin
exports.getYearlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();

    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      // Loyers
      const paiementsLoyers = await Paiement.find({
        mois: month,
        annee: year
      });
      const totalLoyers = paiementsLoyers.reduce((sum, p) => sum + p.montant, 0);

      // Salaires
      const paiementsSalaires = await SalairePaiement.find({
        mois: month,
        annee: year
      });
      const totalSalaires = paiementsSalaires.reduce((sum, p) => sum + p.montant, 0);

      monthlyData.push({
        mois: month,
        revenus: totalLoyers,
        depenses: totalSalaires,
        benefice: totalLoyers - totalSalaires
      });
    }

    const totalAnnuel = monthlyData.reduce((sum, m) => sum + m.benefice, 0);

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

