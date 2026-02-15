const mongoose = require('mongoose');

const depenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['électricité', 'eau', 'réparation', 'entretien', 'vitre', 'peinture', 'plomberie', 'autre'],
    required: [true, 'Veuillez indiquer le type de dépense']
  },
  description: {
    type: String,
    required: [true, 'Veuillez fournir une description']
  },
  montant: {
    type: Number,
    required: [true, 'Veuillez indiquer le montant']
  },
  date: {
    type: Date,
    default: Date.now
  },
  fournisseur: {
    type: String
  },
  facture: {
    type: String // Référence facture
  },
  statut: {
    type: String,
    enum: ['payé', 'impayé', 'en cours'],
    default: 'impayé'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Depense', depenseSchema);

