const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assetName: {
    type: String,
    required: true
  },
  assetType: {
    type: String,
    required: true // Contoh: 'Emas', 'Saham', 'Reksa Dana'
  },
  initialAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    required: true
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  returnRate: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);