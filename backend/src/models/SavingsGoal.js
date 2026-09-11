const mongoose = require('mongoose');
const crypto = require('crypto');

const savingsGoalSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  target_amount: {
    type: Number,
    required: true,
  },
  current_amount: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: String,
    required: true,
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

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
