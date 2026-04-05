const Investment = require('../models/Investment');

// @desc    Tambah portofolio investasi
// @route   POST /api/investments
exports.addInvestment = async (req, res) => {
  try {
    const { assetName, assetType, initialAmount, currentAmount } = req.body;

    if (!assetName || !assetType || !initialAmount || !currentAmount) {
       return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const profitLoss = currentAmount - initialAmount;
    const returnRate = ((profitLoss / initialAmount) * 100).toFixed(2);

    const investment = await Investment.create({
      user: req.user.id,
      assetName,
      assetType,
      initialAmount,
      currentAmount,
      profitLoss,
      returnRate
    });

    res.status(201).json({ success: true, data: investment });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Ambil semua data investasi
// @route   GET /api/investments
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });
    res.status(200).json({ success: true, data: investments });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};