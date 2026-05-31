const mongoose = require('mongoose');

const errandSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Delivery', 'Shopping', 'Labor', 'Etc'],
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'MATCHED', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  applicants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now }
  }],
  expiredAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Errand', errandSchema);
