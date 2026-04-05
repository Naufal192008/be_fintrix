const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Dapatkan statistik sistem
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    const allIncomes = await Transaction.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const systemTotalVolume = allIncomes.length > 0 ? allIncomes[0].total : 0;

    res.status(200).json({
      success: true,
      data: { totalUsers, totalTransactions, systemTotalVolume }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Lihat daftar semua user (SESUAI REQUEST FE)
exports.getAllUsers = async (req, res) => {
  try {
    // FE minta array langsung untuk di-map
    const users = await User.find().select('name email provider isVerified twoFactorEnabled createdAt');
    res.status(200).json(users); 
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};