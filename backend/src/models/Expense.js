const mongoose = require('mongoose');
const crypto = require('crypto');

const expenseSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
    default: () => new Date().toISOString(),
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  upi_transaction: {
    type: String,
    enum: ['YES', 'NO'],
    default: 'NO',
    set: (v) => (v === true || v === 'true' || v === 'YES') ? 'YES' : 'NO',
  },
  created_by: {
    type: String,
    default: 'system',
  },
  updated_by: {
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

module.exports = mongoose.model('Expense', expenseSchema);
