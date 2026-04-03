const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  googleCallback,
  logoutUser,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Local auth routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth routes
// Route untuk memicu login Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route CALLBACK (Ini yang paling penting!)
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/login', // Ke hal login kalau gagal
    session: true 
  }),
  (req, res) => {
    // BERHASIL! Arahkan langsung ke halaman Dashboard (Vite port 5173)
    res.redirect('http://localhost:5173/dashboard'); 
  }
);

// Check auth status
router.get('/status', protect, (req, res) => {
  res.json({ 
    isAuthenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

module.exports = router;