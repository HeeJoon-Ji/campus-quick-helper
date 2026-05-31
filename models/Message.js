const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  errandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Errand',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
