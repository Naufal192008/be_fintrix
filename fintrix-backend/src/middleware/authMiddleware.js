const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Session authentication
  // Bypasses JWT check if passport session exists
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // 2. JWT authentication via headers or cookies
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

    // Check lock status to prevent brute force
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

// RBAC: Admin authorization
const admin = (req, res, next) => {
  // Validate admin role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak! Area ini khusus Admin' });
  }
};

// Optional auth (populates user context if authenticated, but passes through if not)
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
      // Silently fail to allow public access
    }
  }
  
  next();
};

module.exports = { protect, admin, optionalAuth };