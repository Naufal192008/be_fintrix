const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken -twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;
    if (req.body.currency) user.currency = req.body.currency;
    if (req.body.language) user.language = req.body.language;
    if (req.body.theme) user.theme = req.body.theme;

    if (req.body.email && req.body.email !== user.email) {
      // Check if email already exists
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
      user.isVerified = false; // Require re-verification
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      isVerified: updatedUser.isVerified,
      provider: updatedUser.provider,
      currency: updatedUser.currency,
      language: updatedUser.language,
      theme: updatedUser.theme
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Instead of deleting, you might want to anonymize or soft delete
    await user.deleteOne();

    res.clearCookie('token');
    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -refreshToken -twoFactorSecret');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// @desc    Enable 2FA
// @route   POST /api/users/enable-2fa
// @access  Private
const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    // Generate 2FA secret (implement with speakeasy or similar)
    // const secret = speakeasy.generateSecret();
    
    // user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();

    res.json({ 
      message: '2FA enabled successfully',
      // secret: secret.otpauth_url 
    });

  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Error enabling 2FA' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/users/disable-2fa
// @access  Private
const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ message: '2FA disabled successfully' });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Error disabling 2FA' });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    // This would typically fetch from a separate transactions model
    // For now, return mock data
    res.json({
      totalBalance: 24580.00,
      income: 8240,
      expenses: 3680,
      savingsGoal: 100,
      recentTransactions: [
        { id: 1, description: 'Salary', amount: 5000, type: 'income', date: '2024-01-15' },
        { id: 2, description: 'Rent', amount: 1500, type: 'expense', date: '2024-01-14' },
        { id: 3, description: 'Groceries', amount: 200, type: 'expense', date: '2024-01-13' }
      ]
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUsers,
  enableTwoFactor,
  disableTwoFactor,
  getUserStats
};