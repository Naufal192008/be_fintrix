const Investment = require('../models/Investment');

// @desc    Tambah portofolio investasi
// @route   POST /api/investments
// @access  Private
exports.addInvestment = async (req, res) => {
  try {
    const { assetName, assetType, initialAmount, currentAmount } = req.body;

    if (!assetName || !assetType || !initialAmount || !currentAmount) {
       return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const profitLoss = currentAmount - initialAmount;
    const returnRate = Number(((profitLoss / initialAmount) * 100).toFixed(2));

    const investment = await Investment.create({
      user: req.user.id,
      assetName,
      assetType,
      initialAmount: Number(initialAmount),
      currentAmount: Number(currentAmount),
      profitLoss,
      returnRate
    });

    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: req.user.id,
        type: 'investment',
        title: 'Investment portfolio updated',
        message: `Your new investment ${assetName} was added with an initial amount of $${initialAmount}.`,
        tag: 'Investment',
        isRead: false
      });
    } catch (notifErr) { }

    res.status(201).json({ success: true, data: investment });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Ambil semua data investasi user
// @route   GET /api/investments
// @access  Private
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: investments });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Hapus investasi
// @route   DELETE /api/investments/:id
// @access  Private
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: 'Investasi tidak ditemukan' });
    }

    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Akses ditolak' });
    }

    await investment.deleteOne();
    res.status(200).json({ success: true, message: 'Investasi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};