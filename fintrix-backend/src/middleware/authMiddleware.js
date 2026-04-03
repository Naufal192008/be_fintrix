const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    const user = await User.findById(decoded.id).select('-password -refreshToken -twoFactorSecret');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isLocked()) {
      return res.status(423).json({ message: 'Account is locked. Please try again later.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

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
      // Ignore token errors for optional auth
    }
  }
  
  next();
};

module.exports = { protect, admin, optionalAuth };