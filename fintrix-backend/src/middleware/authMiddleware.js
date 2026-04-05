const { verifyToken } = require('../utils/generateToken'); // Pastikan file utils ini ada
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Cek Auth via Session (Passport/Google Auth)
  // Jika req.isAuthenticated() ada (dari passport), berarti dia user valid
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // 2. Cek Auth via Token (Header atau Cookies)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, silakan login terlebih dahulu' });
  }

  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    const user = await User.findById(decoded.id).select('-password -refreshToken -twoFactorSecret');
    
    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    // Cek apakah akun dikunci (Dari logic Model User kamu)
    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({ message: 'Akun terkunci. Silakan coba lagi nanti.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token gagal diverifikasi' });
  }
};

// Middleware Khusus Admin
const admin = (req, res, next) => {
  // Cek apakah user ada dan rolenya 'admin'
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak! Area ini khusus Admin' });
  }
};

// Middleware Opsional (Misal untuk halaman landing yang bisa lihat data publik)
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id).select('-password');
        req.user = user;
      }
    } catch (error) {
      // Abaikan error untuk optional
    }
  }
  
  next();
};

module.exports = { protect, admin, optionalAuth };