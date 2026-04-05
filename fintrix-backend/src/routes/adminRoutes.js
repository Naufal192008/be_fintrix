const express = require('express');
const router = express.Router();

// Import Controller
const { 
    getAllUsers, 
    getSystemStats 
} = require('../controllers/adminController');

// Import Middleware Keamanan
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/users
 * @desc    Ambil semua daftar user untuk tabel di Dashboard Admin
 * @access  Private (Admin Only)
 */
router.get('/users', protect, admin, getAllUsers);

/**
 * @route   GET /api/admin/stats
 * @desc    Dapatkan data statistik (Total Users, Transaksi, dll) untuk Stat Cards
 * @access  Private (Admin Only)
 */
router.get('/stats', protect, admin, getSystemStats);

// Jika nanti ada fitur hapus user oleh admin, bisa tambah di sini:
// router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;