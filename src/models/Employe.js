const mongoose = require('mongoose');

const employeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez fournir le nom']
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez fournir le prénom']
  },
  email: {
    type: String,
    required: [true, 'Veuillez fournir un email'],
    unique: true
  },
  telephone: {
    type: String,
    required: true
  },
  fonction: {
    type: String,
    required: [true, 'Veuillez indiquer la fonction'],
    enum: ['Agent de sécurité', 'Agent d\'entretien', 'Réceptionniste', 'Gestionnaire', 'Technicien', 'Autre']
  },
  salaire: {
    type: Number,
    required: [true, 'Veuillez indiquer le salaire']
  },
  dateEmbauche: {
    type: Date,
    required: [true, 'Veuillez indiquer la date d\'embauche']
  },
  actif: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employe', employeSchema);

