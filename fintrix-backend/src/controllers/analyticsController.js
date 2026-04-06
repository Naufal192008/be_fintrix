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

    const chartData = Object.keys(categoryTotals)
      .map((key) => ({ category: key, total: categoryTotals[key] }))
      .sort((a, b) => b.total - a.total); // sort descending

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Perbandingan pengeluaran bulan ini vs bulan lalu
// @route   GET /api/analytics/monthly-comparison
exports.getMonthlyComparison = async (req, res) => {
  try {
    const now = new Date();
    const startThisMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth    = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonthTx, lastMonthTx] = await Promise.all([
      Transaction.find({ user: req.user.id, type: 'expense', date: { $gte: startThisMonth } }),
      Transaction.find({ user: req.user.id, type: 'expense', date: { $gte: startLastMonth, $lte: endLastMonth } }),
    ]);

    const thisTotal = thisMonthTx.reduce((s, t) => s + t.amount, 0);
    const lastTotal = lastMonthTx.reduce((s, t) => s + t.amount, 0);
    const diff      = thisTotal - lastTotal;
    const changePct = lastTotal > 0 ? Number(((diff / lastTotal) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      data: { thisMonth: thisTotal, lastMonth: lastTotal, diff, changePct }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Kategori dengan pengeluaran tertinggi
// @route   GET /api/analytics/highest-category
exports.getHighestCategory = async (req, res) => {
  try {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: startThisMonth }
    });

    if (expenses.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    const categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const highest = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];

    res.status(200).json({
      success: true,
      data: { category: highest[0], total: highest[1] }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};