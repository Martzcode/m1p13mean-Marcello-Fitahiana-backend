const mongoose = require('mongoose');

const salairePaiementSchema = new mongoose.Schema({
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
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
    enum: ['espèces', 'virement', 'chèque'],
    default: 'virement'
  },
  statut: {
    type: String,
    enum: ['payé', 'impayé'],
    default: 'payé'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour éviter les doublons
salairePaiementSchema.index({ employe: 1, mois: 1, annee: 1 }, { unique: true });

module.exports = mongoose.model('SalairePaiement', salairePaiementSchema);

