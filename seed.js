require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const CentreCommercial = require('./src/models/CentreCommercial');
const Zone = require('./src/models/Zone');
const Boutique = require('./src/models/Boutique');
const Loyer = require('./src/models/Loyer');
const Paiement = require('./src/models/Paiement');
const Produit = require('./src/models/Produit');
const Commande = require('./src/models/Commande');
const Panier = require('./src/models/Panier');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://centrecommercial:MotDePasseFort123@localhost:27017/centrecommercial?authSource=admin';

const defaultHoraires = {
  lundi: { ouverture: '09:00', fermeture: '19:00' },
  mardi: { ouverture: '09:00', fermeture: '19:00' },
  mercredi: { ouverture: '09:00', fermeture: '19:00' },
  jeudi: { ouverture: '09:00', fermeture: '19:00' },
  vendredi: { ouverture: '09:00', fermeture: '19:00' },
  samedi: { ouverture: '10:00', fermeture: '20:00' },
  dimanche: { ouverture: '10:00', fermeture: '17:00' }
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Nettoyer les données existantes
    await Promise.all([
      User.deleteMany({}),
      CentreCommercial.deleteMany({}),
      Zone.deleteMany({}),
      Boutique.deleteMany({}),
      Loyer.deleteMany({}),
      Paiement.deleteMany({}),
      Produit.deleteMany({}),
      Commande.deleteMany({}),
      Panier.deleteMany({})
    ]);
    console.log('Cleared existing data');

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

    const commercants = await User.create([
      { nom: 'Rakoto', prenom: 'Jean', email: 'jean.rakoto@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 11 111 11', actif: true },
      { nom: 'Raza', prenom: 'Marie', email: 'marie.raza@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 22 222 22', actif: true },
      { nom: 'Andriam', prenom: 'Paul', email: 'paul.andriam@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 33 333 33', actif: true },
      { nom: 'Ranaivo', prenom: 'Sophie', email: 'sophie.ranaivo@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 44 444 44', actif: true },
      { nom: 'Raharison', prenom: 'Lucas', email: 'lucas.raharison@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 55 555 55', actif: true },
      { nom: 'Rakoto', prenom: 'Feno', email: 'feno.rakoto@centre.mg', password: 'password123', role: 'commerçant', telephone: '+261 34 66 666 66', actif: false }
    ]);

    const client = await User.create({
      nom: 'Razafindrakoto',
      prenom: 'Client',
      email: 'client@centre.mg',
      password: 'client123',
      role: 'client',
      telephone: '+261 34 77 777 77',
      actif: true
    });
    console.log('Users created');

    // ========== CENTRE COMMERCIAL ==========
    await CentreCommercial.create({
      nom: 'Centre Commercial Ankorondrano',
      adresse: {
        rue: 'Avenue de l\'Independance',
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

    // ========== ZONES ==========
    const zones = await Zone.create([
      { nom: 'Zone A - Rez-de-chaussee', description: 'Zone principale du rez-de-chaussee', etage: 0, superficie: 1500 },
      { nom: 'Zone B - Premier etage', description: 'Zone du premier etage', etage: 1, superficie: 1200 },
      { nom: 'Zone C - Deuxieme etage', description: 'Zone du deuxieme etage', etage: 2, superficie: 800 }
    ]);

    // ========== BOUTIQUES (avec horaires et images) ==========
    const boutiques = await Boutique.create([
      { numero: 'A-001', nom: 'Fashion Store', categorie: 'Mode', surface: 80, zone: zones[0]._id, commercant: commercants[0]._id, statut: 'occupée', description: 'Boutique de vetements tendance', telephone: '+261 34 11 111 11', email: 'fashion@centre.mg', horaires: defaultHoraires, actif: true },
      { numero: 'A-002', nom: 'Cosmetique Paradis', categorie: 'Cosmétique', surface: 60, zone: zones[0]._id, commercant: commercants[1]._id, statut: 'occupée', description: 'Produits de beaute', telephone: '+261 34 22 222 22', email: 'cosmetique@centre.mg', horaires: defaultHoraires, actif: true },
      { numero: 'B-001', nom: 'Tech World', categorie: 'Électronique', surface: 100, zone: zones[1]._id, commercant: commercants[2]._id, statut: 'occupée', description: 'Electronique et high-tech', telephone: '+261 34 33 333 33', email: 'tech@centre.mg', horaires: defaultHoraires, actif: true },
      { numero: 'A-005', nom: 'Alimentation Bio', categorie: 'Alimentation', surface: 70, zone: zones[0]._id, commercant: commercants[0]._id, statut: 'occupée', description: 'Produits bio et naturels', telephone: '+261 34 11 111 11', email: 'bio@centre.mg', horaires: defaultHoraires, actif: true },
      { numero: 'B-002', nom: 'Restaurant Le Bon Gout', categorie: 'Restauration', surface: 120, zone: zones[1]._id, commercant: commercants[3]._id, statut: 'occupée', description: 'Restaurant gastronomique', telephone: '+261 34 44 444 44', email: 'restaurant@centre.mg', horaires: { ...defaultHoraires, dimanche: { ouverture: '11:00', fermeture: '15:00' } }, actif: true },
      { numero: 'A-003', nom: 'Sport Plus', categorie: 'Sport', surface: 90, zone: zones[0]._id, commercant: commercants[4]._id, statut: 'occupée', description: 'Articles de sport', telephone: '+261 34 55 555 55', email: 'sport@centre.mg', horaires: defaultHoraires, actif: true },
      { numero: 'C-001', nom: 'Librairie Ancienne', categorie: 'Librairie', surface: 50, zone: zones[2]._id, commercant: commercants[5]._id, statut: 'libre', description: 'Ancien contrat resilie', actif: false },
      { numero: 'A-004', nom: 'Boutique A-004', categorie: 'Autre', surface: 65, zone: zones[0]._id, statut: 'libre', actif: true },
      { numero: 'B-003', nom: 'Boutique B-003', categorie: 'Autre', surface: 75, zone: zones[1]._id, statut: 'libre', actif: true },
      { numero: 'C-002', nom: 'Boutique C-002', categorie: 'Autre', surface: 55, zone: zones[2]._id, statut: 'libre', actif: true }
    ]);
    console.log(`${boutiques.length} boutiques created`);

    // Associer boutiques aux commercants
    await User.findByIdAndUpdate(commercants[0]._id, { boutiques: [boutiques[0]._id, boutiques[3]._id] });
    await User.findByIdAndUpdate(commercants[1]._id, { boutiques: [boutiques[1]._id] });
    await User.findByIdAndUpdate(commercants[2]._id, { boutiques: [boutiques[2]._id] });
    await User.findByIdAndUpdate(commercants[3]._id, { boutiques: [boutiques[4]._id] });
    await User.findByIdAndUpdate(commercants[4]._id, { boutiques: [boutiques[5]._id] });

    // ========== PRODUITS (20+ produits) ==========
    const produits = await Produit.create([
      // Fashion Store (commercant 0)
      { nom: 'T-shirt Premium', description: 'T-shirt en coton bio', prix: 45000, stock: 50, categorie: 'Vêtements', boutique: boutiques[0]._id, actif: true },
      { nom: 'Jean Slim', description: 'Jean slim fit homme', prix: 85000, stock: 30, categorie: 'Vêtements', boutique: boutiques[0]._id, actif: true },
      { nom: 'Robe d\'ete', description: 'Robe legere pour l\'ete', prix: 65000, stock: 20, categorie: 'Vêtements', boutique: boutiques[0]._id, actif: true },
      { nom: 'Veste en cuir', description: 'Veste en cuir synthetique', prix: 150000, stock: 10, categorie: 'Vêtements', boutique: boutiques[0]._id, actif: true },
      // Cosmetique Paradis (commercant 1)
      { nom: 'Creme hydratante', description: 'Creme pour visage', prix: 35000, stock: 40, categorie: 'Beauté', boutique: boutiques[1]._id, actif: true },
      { nom: 'Parfum Floral', description: 'Eau de parfum 50ml', prix: 120000, stock: 15, categorie: 'Beauté', boutique: boutiques[1]._id, actif: true },
      { nom: 'Kit Maquillage', description: 'Kit complet de maquillage', prix: 95000, stock: 25, categorie: 'Beauté', boutique: boutiques[1]._id, actif: true },
      // Tech World (commercant 2)
      { nom: 'Ecouteurs Bluetooth', description: 'Ecouteurs sans fil', prix: 75000, stock: 60, categorie: 'Électronique', boutique: boutiques[2]._id, actif: true },
      { nom: 'Chargeur rapide', description: 'Chargeur USB-C 65W', prix: 45000, stock: 100, categorie: 'Électronique', boutique: boutiques[2]._id, actif: true },
      { nom: 'Coque telephone', description: 'Coque de protection', prix: 15000, stock: 200, categorie: 'Électronique', boutique: boutiques[2]._id, actif: true },
      { nom: 'Souris sans fil', description: 'Souris ergonomique', prix: 55000, stock: 35, categorie: 'Électronique', boutique: boutiques[2]._id, actif: true },
      { nom: 'Clavier mecanique', description: 'Clavier gaming RGB', prix: 180000, stock: 8, categorie: 'Électronique', boutique: boutiques[2]._id, actif: true },
      // Alimentation Bio (commercant 0)
      { nom: 'Miel bio', description: 'Miel 100% naturel 500g', prix: 25000, stock: 30, categorie: 'Alimentation', boutique: boutiques[3]._id, actif: true },
      { nom: 'Huile d\'olive', description: 'Huile d\'olive extra vierge', prix: 35000, stock: 20, categorie: 'Alimentation', boutique: boutiques[3]._id, actif: true },
      { nom: 'The vert bio', description: 'The vert en vrac 200g', prix: 18000, stock: 50, categorie: 'Alimentation', boutique: boutiques[3]._id, actif: true },
      // Sport Plus (commercant 4)
      { nom: 'Ballon de foot', description: 'Ballon officiel taille 5', prix: 45000, stock: 25, categorie: 'Sport', boutique: boutiques[5]._id, actif: true },
      { nom: 'Tapis de yoga', description: 'Tapis antiderapant 6mm', prix: 55000, stock: 15, categorie: 'Sport', boutique: boutiques[5]._id, actif: true },
      { nom: 'Halteres 5kg', description: 'Paire d\'halteres 5kg', prix: 70000, stock: 12, categorie: 'Sport', boutique: boutiques[5]._id, actif: true },
      { nom: 'Chaussures running', description: 'Chaussures de course legeres', prix: 135000, stock: 0, categorie: 'Sport', boutique: boutiques[5]._id, actif: true },
      { nom: 'Gourde isotherme', description: 'Gourde 750ml inox', prix: 28000, stock: 40, categorie: 'Sport', boutique: boutiques[5]._id, actif: true },
      // Produit inactif
      { nom: 'Ancien produit', description: 'Produit retire de la vente', prix: 10000, stock: 5, categorie: 'Autre', boutique: boutiques[0]._id, actif: false }
    ]);
    console.log(`${produits.length} produits created`);

    // ========== LOYERS ==========
    const loyers = [];

    // Loyers BIEN PAYES (4 boutiques)
    for (let i = 0; i < 4; i++) {
      loyers.push({
        boutique: boutiques[i]._id,
        commercant: boutiques[i].commercant,
        montant: (i + 1) * 200000,
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

    // Loyer RESILIE
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
    console.log(`${loyersCreated.length} loyers created`);

    // ========== PAIEMENTS ==========
    const paiements = [];
    const today = new Date(2026, 1, 8);

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

    // Boutiques bien payees
    for (let i = 0; i < 4; i++) {
      const loyer = loyersCreated[i];
      for (let offset = -3; offset <= 0; offset++) {
        paiements.push(createPaiement(loyer, offset, 'payé'));
      }
      if (i < 2) {
        for (let offset = 1; offset <= 3; offset++) {
          paiements.push(createPaiement(loyer, offset, 'payé'));
        }
      }
    }

    // Restaurant - EN RETARD 2 MOIS
    const loyerRestaurant = loyersCreated[4];
    for (let offset = -3; offset <= -2; offset++) {
      paiements.push(createPaiement(loyerRestaurant, offset, 'payé'));
    }
    paiements.push(createPaiement(loyerRestaurant, -1, 'impayé'));
    paiements.push(createPaiement(loyerRestaurant, 0, 'impayé'));

    // Sport Plus - EN RETARD 1 MOIS
    const loyerSport = loyersCreated[5];
    for (let offset = -3; offset <= -1; offset++) {
      paiements.push(createPaiement(loyerSport, offset, 'payé'));
    }
    paiements.push(createPaiement(loyerSport, 0, 'impayé'));

    // Librairie RESILIEE
    const loyerLibrairie = loyersCreated[6];
    for (let offset = -3; offset <= -2; offset++) {
      paiements.push(createPaiement(loyerLibrairie, offset, 'payé'));
    }

    await Paiement.create(paiements);
    console.log(`${paiements.length} paiements created`);

    console.log('\n--- Database seeding completed ---');
    console.log('\nTest Accounts:');
    console.log('  Admin: admin@centre.mg / admin123');
    console.log('  Commercant: jean.rakoto@centre.mg / password123');
    console.log('  Commercant (retard): sophie.ranaivo@centre.mg / password123');
    console.log('  Client: client@centre.mg / client123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
