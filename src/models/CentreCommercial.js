const mongoose = require('mongoose');

const centreCommercialSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez fournir le nom du centre commercial'],
    unique: true
  },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: {
      type: String,
      default: 'Madagascar'
    }
  },
  horaires: {
    lundi: { ouverture: String, fermeture: String },
    mardi: { ouverture: String, fermeture: String },
    mercredi: { ouverture: String, fermeture: String },
    jeudi: { ouverture: String, fermeture: String },
    vendredi: { ouverture: String, fermeture: String },
    samedi: { ouverture: String, fermeture: String },
    dimanche: { ouverture: String, fermeture: String }
  },
  description: String,
  email: String,
  telephone: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CentreCommercial', centreCommercialSchema);

