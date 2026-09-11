const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString(),
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('System', systemSchema);
