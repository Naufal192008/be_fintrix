const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUsers,
  enableTwoFactor,
  disableTwoFactor,
  getUserStats
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserAccount);

router.get('/stats', protect, getUserStats);
router.post('/enable-2fa', protect, enableTwoFactor);
router.post('/disable-2fa', protect, disableTwoFactor);

// Admin only routes
router.get('/', protect, admin, getUsers);

module.exports = router;