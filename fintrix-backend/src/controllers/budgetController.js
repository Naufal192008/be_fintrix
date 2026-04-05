const Budget = require('../models/Budget');

// @desc    Set budget bulanan baru
// @route   POST /api/budgets
exports.createBudget = async (req, res) => {
  try {
    const { category, limitAmount, month, year } = req.body;

    if (!category || !limitAmount || !month || !year) {
       return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limitAmount,
      month,
      year
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Ambil daftar budget user
// @route   GET /api/budgets
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};