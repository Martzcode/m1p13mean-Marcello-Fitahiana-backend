const mongoose = require('mongoose');

const loyerSchema = new mongoose.Schema({
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: [true, 'Veuillez associer une boutique']
  },
  commercant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Veuillez associer un commerçant']
  },
  montant: {
    type: Number,
    required: [true, 'Veuillez indiquer le montant du loyer']
  },
  periodicite: {
    type: String,
    enum: ['mensuel', 'trimestriel', 'annuel'],
    default: 'mensuel'
  },
  dateDebut: {
    type: Date,
    required: [true, 'Veuillez indiquer la date de début']
  },
  dateFin: {
    type: Date
  },
  statut: {
    type: String,
    enum: ['actif', 'expiré', 'résilié'],
    default: 'actif'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Méthode pour vérifier si le contrat est expiré
loyerSchema.methods.verifierExpiration = function() {
  if (this.dateFin && this.dateFin < new Date()) {
    this.statut = 'expiré';
  }
  return this.statut;
};

module.exports = mongoose.model('Loyer', loyerSchema);

