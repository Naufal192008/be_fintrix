const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Set budget bulanan baru
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res) => {
  try {
    const { category, limitAmount, month, year, spentOverride } = req.body;

    if (!category || !limitAmount || !month || !year) {
       return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limitAmount,
      month,
      year,
      // Simpan override jika diisi, null jika dikosongkan (auto-calc dari transaksi)
      spentOverride: spentOverride != null && spentOverride !== '' ? Number(spentOverride) : null,
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Ambil daftar budget user + kalkulasi spent dari transaksi (atau override)
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        let spent;

        if (budget.spentOverride != null) {
          // Gunakan nilai override yang disimpan saat create
          spent = budget.spentOverride;
        } else {
          // Hitung otomatis dari transaksi expense
          const startDate = new Date(budget.year, budget.month - 1, 1);
          const endDate   = new Date(budget.year, budget.month, 0, 23, 59, 59);

          const transactions = await Transaction.find({
            user: req.user.id,
            type: 'expense',
            category: budget.category,
            date: { $gte: startDate, $lte: endDate },
          });

          spent = transactions.reduce((sum, trx) => sum + trx.amount, 0);
        }

        return {
          _id:         budget._id,
          category:    budget.category,
          limitAmount: budget.limitAmount,
          month:       budget.month,
          year:        budget.year,
          spent,                                          // ← dihitung dari transaksi riil
          remaining:   budget.limitAmount - spent,        // ← sisa budget
          percent:     budget.limitAmount > 0
            ? Math.min(Math.round((spent / budget.limitAmount) * 100), 100)
            : 0,
          createdAt: budget.createdAt,
        };
      })
    );

    res.status(200).json({ success: true, data: budgetsWithSpent });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Hapus budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget tidak ditemukan' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Akses ditolak' });
    }

    await budget.deleteOne();
    res.status(200).json({ success: true, message: 'Budget berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};