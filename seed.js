require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const CentreCommercial = require('./src/models/CentreCommercial');
const Zone = require('./src/models/Zone');
const Boutique = require('./src/models/Boutique');
const Loyer = require('./src/models/Loyer');
const Paiement = require('./src/models/Paiement');
const Employe = require('./src/models/Employe');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://centrecommercial:MotDePasseFort123@localhost:27017/centrecommercial?authSource=admin';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Nettoyer les données existantes
    await Promise.all([
      User.deleteMany({}),
      CentreCommercial.deleteMany({}),
      Zone.deleteMany({}),
      Boutique.deleteMany({}),
      Loyer.deleteMany({}),
      Paiement.deleteMany({}),
      Employe.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // ========== UTILISATEURS ==========
    const admin = await User.create({
      nom: 'Admin',
      prenom: 'Centre',
      email: 'admin@centre.mg',
      password: 'admin123',
      role: 'administrateur',
      telephone: '+261 34 00 000 00',
      actif: true
    });
    console.log('✅ Admin créé');

    const commercants = await User.create([
      { nom: 'Rakoto', prenom: 'Jean', email: 'jean.rakoto@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 11 111 11', actif: true },
      { nom: 'Raza', prenom: 'Marie', email: 'marie.raza@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 22 222 22', actif: true },
      { nom: 'Andriam', prenom: 'Paul', email: 'paul.andriam@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 33 333 33', actif: true },
      { nom: 'Ranaivo', prenom: 'Sophie', email: 'sophie.ranaivo@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 44 444 44', actif: true },
      { nom: 'Raharison', prenom: 'Lucas', email: 'lucas.raharison@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 55 555 55', actif: true },
      { nom: 'Rakoto', prenom: 'Feno', email: 'feno.rakoto@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 66 666 66', actif: false } // Résilié
    ]);
    console.log(`✅ ${commercants.length} commerçants créés`);

    const client = await User.create({
      nom: 'Razafindrakoto',
      prenom: 'Client',
      email: 'client@centre.mg',
      password: 'client123',
      role: 'client',
      telephone: '+261 34 77 777 77',
      actif: true
    });
    console.log('✅ Client créé');

    // ========== CENTRE COMMERCIAL ==========
    const centre = await CentreCommercial.create({
      nom: 'Centre Commercial Ankorondrano',
      adresse: {
        rue: 'Avenue de l\'Indépendance',
        ville: 'Antananarivo',
        codePostal: '101',
        pays: 'Madagascar'
      },
      horaires: {
        lundi: { ouverture: '08:00', fermeture: '20:00' },
        mardi: { ouverture: '08:00', fermeture: '20:00' },
        mercredi: { ouverture: '08:00', fermeture: '20:00' },
        jeudi: { ouverture: '08:00', fermeture: '20:00' },
        vendredi: { ouverture: '08:00', fermeture: '20:00' },
        samedi: { ouverture: '09:00', fermeture: '21:00' },
        dimanche: { ouverture: '09:00', fermeture: '18:00' }
      },
      description: 'Le plus grand centre commercial d\'Antananarivo',
      email: 'contact@centre-ankorondrano.mg',
      telephone: '+261 20 22 000 00'
    });
    console.log('✅ Centre Commercial créé');

    // ========== ZONES ==========
    const zones = await Zone.create([
      { nom: 'Zone A - Rez-de-chaussée', description: 'Zone principale du rez-de-chaussée', etage: 0, superficie: 1500 },
      { nom: 'Zone B - Premier étage', description: 'Zone du premier étage', etage: 1, superficie: 1200 },
      { nom: 'Zone C - Deuxième étage', description: 'Zone du deuxième étage', etage: 2, superficie: 800 }
    ]);
    console.log(`✅ ${zones.length} zones créées`);

    // ========== BOUTIQUES ==========
    const boutiques = await Boutique.create([
      // BOUTIQUES OCCUPÉES - BIEN PAYÉES
      { numero: 'A-001', nom: 'Fashion Store', categorie: 'Mode', surface: 80, zone: zones[0]._id, commercant: commercants[0]._id, statut: 'occupée', description: 'Boutique de vêtements tendance', telephone: '+261 34 11 111 11', email: 'fashion@centre.mg', actif: true },
      { numero: 'A-002', nom: 'Cosmétique Paradis', categorie: 'Cosmétique', surface: 60, zone: zones[0]._id, commercant: commercants[1]._id, statut: 'occupée', description: 'Produits de beauté', telephone: '+261 34 22 222 22', email: 'cosmetique@centre.mg', actif: true },
      { numero: 'B-001', nom: 'Tech World', categorie: 'Électronique', surface: 100, zone: zones[1]._id, commercant: commercants[2]._id, statut: 'occupée', description: 'Électronique et high-tech', telephone: '+261 34 33 333 33', email: 'tech@centre.mg', actif: true },
      { numero: 'A-005', nom: 'Alimentation Bio', categorie: 'Alimentation', surface: 70, zone: zones[0]._id, commercant: commercants[0]._id, statut: 'occupée', description: 'Produits bio', telephone: '+261 34 11 111 11', email: 'bio@centre.mg', actif: true },

      // BOUTIQUES AVEC RETARDS
      { numero: 'B-002', nom: 'Restaurant Le Bon Goût', categorie: 'Restauration', surface: 120, zone: zones[1]._id, commercant: commercants[3]._id, statut: 'occupée', description: 'Restaurant gastronomique', telephone: '+261 34 44 444 44', email: 'restaurant@centre.mg', actif: true },
      { numero: 'A-003', nom: 'Sport Plus', categorie: 'Sport', surface: 90, zone: zones[0]._id, commercant: commercants[4]._id, statut: 'occupée', description: 'Articles de sport', telephone: '+261 34 55 555 55', email: 'sport@centre.mg', actif: true },

      // BOUTIQUE RÉSILIÉE
      { numero: 'C-001', nom: 'Librairie Ancienne', categorie: 'Librairie', surface: 50, zone: zones[2]._id, commercant: commercants[5]._id, statut: 'libre', description: 'Ancien contrat résilié', actif: false },

      // BOUTIQUES LIBRES
      { numero: 'A-004', nom: 'Boutique A-004', categorie: 'Autre', surface: 65, zone: zones[0]._id, statut: 'libre', actif: true },
      { numero: 'B-003', nom: 'Boutique B-003', categorie: 'Autre', surface: 75, zone: zones[1]._id, statut: 'libre', actif: true },
      { numero: 'C-002', nom: 'Boutique C-002', categorie: 'Autre', surface: 55, zone: zones[2]._id, statut: 'libre', actif: true }
    ]);
    console.log(`✅ ${boutiques.length} boutiques créées (7 occupées, 3 libres)`);

    // ========== LOYERS ==========
    const loyers = [];

    // Loyers BIEN PAYÉS (4 boutiques)
    for (let i = 0; i < 4; i++) {
      loyers.push({
        boutique: boutiques[i]._id,
        commercant: boutiques[i].commercant,
        montant: (i + 1) * 200000, // 200k, 400k, 600k, 800k
        periodicite: 'mensuel',
        dateDebut: new Date(2024, 0, 1),
        dateFin: new Date(2026, 11, 31),
        statut: 'actif'
      });
    }

    // Loyer EN RETARD - Restaurant (2 mois)
    loyers.push({
      boutique: boutiques[4]._id,
      commercant: boutiques[4].commercant,
      montant: 800000,
      periodicite: 'mensuel',
      dateDebut: new Date(2024, 0, 1),
      dateFin: new Date(2026, 11, 31),
      statut: 'actif'
    });

    // Loyer EN RETARD - Sport (1 mois)
    loyers.push({
      boutique: boutiques[5]._id,
      commercant: boutiques[5].commercant,
      montant: 450000,
      periodicite: 'mensuel',
      dateDebut: new Date(2024, 0, 1),
      dateFin: new Date(2026, 11, 31),
      statut: 'actif'
    });

    // Loyer RÉSILIÉ
    loyers.push({
      boutique: boutiques[6]._id,
      commercant: boutiques[6].commercant,
      montant: 350000,
      periodicite: 'mensuel',
      dateDebut: new Date(2024, 0, 1),
      dateFin: new Date(2025, 11, 31),
      statut: 'résilié'
    });

    const loyersCreated = await Loyer.create(loyers);
    console.log(`✅ ${loyersCreated.length} loyers créés`);

    // ========== PAIEMENTS (HISTORIQUE ENRICHI) ==========
    const paiements = [];
    const today = new Date(2026, 1, 8); // 8 février 2026

    // Fonction helper pour créer un paiement
    const createPaiement = (loyer, moisOffset, statut = 'payé') => {
      const targetDate = new Date(today);
      targetDate.setMonth(today.getMonth() + moisOffset);

      return {
        loyer: loyer._id,
        commercant: loyer.commercant,
        montant: loyer.montant,
        mois: targetDate.getMonth() + 1,
        annee: targetDate.getFullYear(),
        datePaiement: statut === 'payé' ? new Date(targetDate.getFullYear(), targetDate.getMonth(), 5) : null,
        methodePaiement: ['virement', 'espèces', 'chèque'][Math.floor(Math.random() * 3)],
        statut: statut,
        reference: `PAY-${loyer.boutique}-${targetDate.getMonth() + 1}-${targetDate.getFullYear()}`
      };
    };

    // SCÉNARIO 1: Boutiques BIEN PAYÉES (4 boutiques) - Payé jusqu'à aujourd'hui + 3 mois d'avance
    // Fashion Store (200k), Cosmétique (400k), Tech World (600k), Alimentation Bio (800k)
    for (let i = 0; i < 4; i++) {
      const loyer = loyersCreated[i];

      // -3 mois à aujourd'hui (4 mois)
      for (let offset = -3; offset <= 0; offset++) {
        paiements.push(createPaiement(loyer, offset, 'payé'));
      }

      // PAYEURS EN AVANCE: +1, +2, +3 mois déjà payés
      if (i < 2) { // Fashion Store et Cosmétique payent en avance
        for (let offset = 1; offset <= 3; offset++) {
          paiements.push(createPaiement(loyer, offset, 'payé'));
        }
      }
    }

    // SCÉNARIO 2: Restaurant - EN RETARD 2 MOIS (décembre 2025 et janvier 2026 NON payés)
    const loyerRestaurant = loyersCreated[4];

    // Payé jusqu'à novembre 2025
    for (let offset = -3; offset <= -2; offset++) {
      paiements.push(createPaiement(loyerRestaurant, offset, 'payé'));
    }
    // Décembre 2025 et Janvier 2026 - IMPAYÉS (offset -1 et 0)
    paiements.push(createPaiement(loyerRestaurant, -1, 'impayé'));
    paiements.push(createPaiement(loyerRestaurant, 0, 'impayé'));

    // SCÉNARIO 3: Sport Plus - EN RETARD 1 MOIS (janvier 2026 NON payé)
    const loyerSport = loyersCreated[5];

    // Payé jusqu'à décembre 2025
    for (let offset = -3; offset <= -1; offset++) {
      paiements.push(createPaiement(loyerSport, offset, 'payé'));
    }
    // Janvier 2026 - IMPAYÉ (offset 0)
    paiements.push(createPaiement(loyerSport, 0, 'impayé'));

    // SCÉNARIO 4: Librairie RÉSILIÉE - Historique jusqu'à résiliation
    const loyerLibrairie = loyersCreated[6];
    for (let offset = -3; offset <= -2; offset++) {
      paiements.push(createPaiement(loyerLibrairie, offset, 'payé'));
    }

    await Paiement.create(paiements);
    console.log(`✅ ${paiements.length} paiements créés (6 mois: -3 à +3)`);

    // ========== EMPLOYÉS ==========
    const employes = await Employe.create([
      { nom: 'Rasoa', prenom: 'Hery', fonction: 'Agent de sécurité', email: 'hery.rasoa@centre.mg', telephone: '+261 34 88 888 88', dateEmbauche: new Date(2023, 0, 15), salaire: 800000, actif: true },
      { nom: 'Randria', prenom: 'Nivo', fonction: 'Agent d\'entretien', email: 'nivo.randria@centre.mg', telephone: '+261 34 99 999 99', dateEmbauche: new Date(2023, 5, 1), salaire: 600000, actif: true },
      { nom: 'Rafidy', prenom: 'Soa', fonction: 'Réceptionniste', email: 'soa.rafidy@centre.mg', telephone: '+261 34 00 000 11', dateEmbauche: new Date(2024, 2, 10), salaire: 700000, actif: true }
    ]);
    console.log(`✅ ${employes.length} employés créés`);

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📊 RÉSUMÉ DES DONNÉES:');
    console.log(`   - Utilisateurs: ${1 + commercants.length + 1} (1 admin, ${commercants.length} commerçants, 1 client)`);
    console.log(`   - Boutiques: ${boutiques.length} (7 occupées, 3 libres)`);
    console.log(`   - Loyers: ${loyersCreated.length} (4 à jour, 2 en retard, 1 résilié)`);
    console.log(`   - Paiements: ${paiements.length} (période: -3 mois à +3 mois)`);
    console.log(`   - Employés: ${employes.length}`);
    console.log('\n💰 SCÉNARIOS DE PAIEMENT:');
    console.log(`   ✅ Fashion Store & Cosmétique: Payés en AVANCE (jusqu'à +3 mois)`);
    console.log(`   ✅ Tech World & Alimentation Bio: À JOUR (payé jusqu'à aujourd'hui)`);
    console.log(`   ⚠️  Restaurant Le Bon Goût: RETARD 2 mois (1,600,000 Ar)`);
    console.log(`   ⚠️  Sport Plus: RETARD 1 mois (450,000 Ar)`);
    console.log(`   ❌ Librairie: Contrat RÉSILIÉ`);
    console.log(`   - TOTAL RETARDS: 2,050,000 Ar`);
    console.log('\n📝 Test Accounts:');
    console.log('   Admin: admin@centre.mg / admin123');
    console.log('   Commerçant (en avance): jean.rakoto@centre.mg / password123');
    console.log('   Commerçant (retard 2 mois): sophie.ranaivo@centre.mg / password123');
    console.log('   Commerçant (retard 1 mois): lucas.raharison@centre.mg / password123');
    console.log('   Client: client@centre.mg / client123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

seedDatabase();

