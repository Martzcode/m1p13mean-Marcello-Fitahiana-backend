const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  stock: {
    type: Number,
    required: [true, 'Le stock est requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  images: [{
    type: String // URLs des images
  }],
  categorie: {
    type: String,
    trim: true,
    enum: ['Vêtements', 'Électronique', 'Alimentation', 'Beauté', 'Sport', 'Maison', 'Autre'],
    default: 'Autre'
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: [true, 'La boutique est requise'],
    index: true
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // createdAt, updatedAt
});

// Index composé pour recherche rapide
produitSchema.index({ boutique: 1, actif: 1 });
produitSchema.index({ categorie: 1, actif: 1 });
produitSchema.index({ nom: 'text', description: 'text' }); // Recherche texte

module.exports = mongoose.model('Produit', produitSchema);

