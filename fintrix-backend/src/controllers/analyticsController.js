const Transaction = require('../models/Transaction');

// @desc    Dapatkan ringkasan total (Income vs Expense)
// @route   GET /api/analytics/summary
exports.getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((trx) => {
      if (trx.type === 'income') {
        totalIncome += trx.amount;
      } else if (trx.type === 'expense') {
        totalExpense += trx.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      data: { totalIncome, totalExpense, balance }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Dapatkan data pengeluaran berdasarkan kategori untuk Chart
// @route   GET /api/analytics/category
exports.getSpendingByCategory = async (req, res) => {
  try {
    const expenses = await Transaction.find({ 
      user: req.user.id, 
      type: 'expense' 
    });

    const categoryTotals = {};

    expenses.forEach((exp) => {
      if (categoryTotals[exp.category]) {
        categoryTotals[exp.category] += exp.amount;
      } else {
        categoryTotals[exp.category] = exp.amount;
      }
    });

    const chartData = Object.keys(categoryTotals).map((key) => ({
      category: key,
      total: categoryTotals[key]
    }));

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};