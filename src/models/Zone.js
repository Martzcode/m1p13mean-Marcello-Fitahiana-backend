const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez fournir le nom de la zone']
  },
  description: {
    type: String
  },
  etage: {
    type: Number,
    required: [true, 'Veuillez indiquer l\'étage']
  },
  superficie: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Zone', zoneSchema);

