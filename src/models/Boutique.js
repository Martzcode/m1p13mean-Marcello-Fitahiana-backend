const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: [true, 'Veuillez fournir le numéro de la boutique'],
    unique: true
  },
  nom: {
    type: String,
    required: [true, 'Veuillez fournir le nom de la boutique']
  },
  categorie: {
    type: String,
    required: [true, 'Veuillez fournir la catégorie'],
    enum: ['Mode', 'Alimentation', 'Électronique', 'Cosmétique', 'Sport', 'Librairie', 'Restauration', 'Services', 'Autre']
  },
  surface: {
    type: Number,
    required: [true, 'Veuillez fournir la surface en m²']
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: [true, 'Veuillez associer une zone']
  },
  statut: {
    type: String,
    enum: ['libre', 'occupée'],
    default: 'libre'
  },
  commercant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: String,
  telephone: String,
  email: String,
  actif: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Boutique', boutiqueSchema);

