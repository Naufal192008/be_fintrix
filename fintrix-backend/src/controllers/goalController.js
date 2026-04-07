const Goal = require('../models/Goal');

// @desc    Ambil data tabungan
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    let goals = await Goal.find({ user: req.user.id });
    
    // TRIK PRESENTASI: Kalau kosong, otomatis bikinin 1 data biar UI gak rusak
    if (goals.length === 0) {
      const newGoal = await Goal.create({
        user: req.user.id,
        title: "Emergency fund target",
        targetAmount: 10000,
        currentAmount: 0
      });
      goals = [newGoal];
    }

    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Tambah nominal ke tabungan yang sudah ada
// @route   PUT /api/goals/:id/add
exports.addProgress = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal tidak ditemukan' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Akses ditolak' });
    }

    // Tambahkan saldo
    goal.currentAmount += Number(amount);
    await goal.save();

    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};