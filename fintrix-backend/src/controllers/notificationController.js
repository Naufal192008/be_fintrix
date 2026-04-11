const Notification = require('../models/Notification');

// @desc    Ambil semua notifikasi user
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 });
    
    // Jika masih null/0 (baru pertama kali join), berikan notifikasi dummy otomatis
    if (notifications.length === 0) {
      const dummyNotifs = [
        { user: req.user.id, type: 'budget', title: 'Welcome to Fintrix', message: 'You have successfully set up your account. Try setting a budget!', tag: 'System', isRead: false },
        { user: req.user.id, type: 'reminder', title: 'Daily Reminder', message: 'Keep your financial records up to date by logging your expenses.', tag: 'Reminder', isRead: false }
      ];
      await Notification.insertMany(dummyNotifs);
      notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 });
    }

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Tandai notifikasi sudah dibaca
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Akses ditolak' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Tandai semua notifikasi sudah dibaca
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};