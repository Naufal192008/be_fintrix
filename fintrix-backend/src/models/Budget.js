const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  limitAmount: {
    type: Number,
    required: true
  },
  month: {
    type: Number, // Contoh: 4 (untuk April)
    required: true
  },
  year: {
    type: Number, // Contoh: 2026
    required: true
  },
  spentOverride: {
    type: Number,
    default: null   // null = otomatis dari transaksi, angka = manual override
  }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);