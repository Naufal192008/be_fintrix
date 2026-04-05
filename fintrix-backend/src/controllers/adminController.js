const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Dapatkan statistik sistem untuk Dashboard Admin
// @route   GET /api/admin/stats
exports.getSystemStats = async (req, res) => {
  try {
    // Memastikan hanya admin yang bisa akses bisa diatur di Middleware, 
    // tapi kita beri pengaman ganda di sini jika diperlukan.
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Khusus Admin.' });
    }

    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    // Total uang yang berputar di sistem (semua income)
    const allIncomes = await Transaction.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const systemTotalVolume = allIncomes.length > 0 ? allIncomes[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        systemTotalVolume
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Lihat daftar semua user (Tanpa password)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Khusus Admin.' });
    }

    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};