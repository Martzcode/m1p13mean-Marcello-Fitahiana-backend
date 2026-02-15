const mongoose = require('mongoose');

// Fonction pour générer numéro de commande unique
const generateCommandeNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `CMD-${year}${month}${day}-${random}`;
};

const commandeSchema = new mongoose.Schema({
  numero: {
    type: String,
    unique: true,
    default: generateCommandeNumber
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le client est requis'],
    index: true
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: [true, 'La boutique est requise'],
    index: true
  },
  produits: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit'
    },
    nom: {
      type: String,
      required: true
    },
    prix: {
      type: Number,
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: [1, 'La quantité doit être au moins 1']
    },
    sousTotal: {
      type: Number,
      required: true
    }
  }],
  montantTotal: {
    type: Number,
    required: [true, 'Le montant total est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  statut: {
    type: String,
    enum: ['nouvelle', 'confirmee', 'en_preparation', 'prete', 'livree', 'annulee'],
    default: 'nouvelle',
    index: true
  },
  modePaiement: {
    type: String,
    enum: ['livraison', 'en_ligne'],
    required: [true, 'Le mode de paiement est requis']
  },
  paye: {
    type: Boolean,
    default: false
  },
  dateCommande: {
    type: Date,
    default: Date.now,
    index: true
  },
  dateLivraison: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index composés
commandeSchema.index({ client: 1, dateCommande: -1 });
commandeSchema.index({ boutique: 1, statut: 1 });
commandeSchema.index({ boutique: 1, dateCommande: -1 });

module.exports = mongoose.model('Commande', commandeSchema);

