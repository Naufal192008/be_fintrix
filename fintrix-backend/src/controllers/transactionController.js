const Transaction = require('../models/Transaction');

// @desc    Tambah transaksi baru (Income/Expense)
// @route   POST /api/transactions
exports.addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      description: description || ''
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Ambil semua riwayat transaksi user
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Hapus transaksi
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Akses ditolak' });
    }

    await transaction.deleteOne();
    res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};