const mongoose = require('mongoose');

const panierSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le client est requis'],
    unique: true, // Un seul panier par client
    index: true
  },
  items: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: [1, 'La quantité doit être au moins 1']
    },
    prix: {
      type: Number,
      required: true // Prix au moment de l'ajout
    }
  }],
  montantTotal: {
    type: Number,
    default: 0,
    min: [0, 'Le montant ne peut pas être négatif']
  }
}, {
  timestamps: true
});

// Méthode pour calculer le montant total
panierSchema.methods.calculateTotal = function() {
  this.montantTotal = this.items.reduce((total, item) => {
    return total + (item.prix * item.quantite);
  }, 0);
  return this.montantTotal;
};

// Hook pre-save pour calculer montant total
panierSchema.pre('save', function(next) {
  this.calculateTotal();
  next();
});

module.exports = mongoose.model('Panier', panierSchema);

