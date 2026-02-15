const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  loyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loyer',
    required: true
  },
  commercant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  montant: {
    type: Number,
    required: [true, 'Veuillez indiquer le montant']
  },
  mois: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  annee: {
    type: Number,
    required: true
  },
  datePaiement: {
    type: Date,
    default: Date.now
  },
  methodePaiement: {
    type: String,
    enum: ['espèces', 'carte', 'virement', 'chèque'],
    default: 'espèces'
  },
  statut: {
    type: String,
    enum: ['payé', 'impayé', 'partiel'],
    default: 'payé'
  },
  reference: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour éviter les doublons
paiementSchema.index({ loyer: 1, mois: 1, annee: 1 }, { unique: true });

module.exports = mongoose.model('Paiement', paiementSchema);

