const mongoose = require('mongoose');
const crypto = require('crypto');

const investmentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  asset_name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  current_value: {
    type: Number,
    required: true,
  },
  purchase_date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  created_by: {
    type: String,
    default: 'system',
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString(),
  }
}, {
  timestamps: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (!ret.id && ret._id) ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (!ret.id && ret._id) ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Investment', investmentSchema);
