require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import Utils & Routes
const { generateToken, generateRefreshToken } = require('./src/utils/generateToken');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const investmentRoutes = require('./src/routes/investmentRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const goalRoutes = require('./src/routes/goalRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─────────────────────────────────────────
// DATABASE CONNECTION
// ─────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Fintrix DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Lazy load User model (after mongoose connects)
let User;
const getUser = () => {
  if (!User) {
    // Build inline User schema (minimal for Google auth flow)
    const userSchema = new mongoose.Schema({
      googleId: { type: String },
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, select: false },
      avatar: { type: String, default: '' },
      provider: { type: String, default: 'local' },
      isVerified: { type: Boolean, default: false },
      refreshToken: { type: String },
      lastLogin: { type: Date },
      loginAttempts: { type: Number, default: 0 },
      lockUntil: { type: Date },
    }, { timestamps: true });

    // Apply existing model if defined to prevent OverwriteModelError
    try {
      User = mongoose.model('User');
    } catch {
      User = mongoose.model('User', userSchema);
    }
  }
  return User;
};

// ─────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || "fintrix_secret_key_2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ─────────────────────────────────────────
// PASSPORT GOOGLE STRATEGY
// ─────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5050/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const UserModel = getUser();
      let user = await UserModel.findOne({ googleId: profile.id });

      if (!user) {
        // Check if an account already exists with this email
        user = await UserModel.findOne({ email: profile.emails[0].value });
        if (user) {
          // Merge Google OAuth profile to existing account
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0].value;
          user.isVerified = true;
          await user.save();
        } else {
          // Register new user account
          user = await UserModel.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            provider: 'google',
            isVerified: true
          });
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const UserModel = getUser();
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────

// Trigger Google Login
app.get("/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

// Google OAuth Callback
app.get("/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_failed`
  }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT and Refresh token for REST API access
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Persist refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      // Save session securely, then redirect to React frontend with tokens
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect(`${CLIENT_URL}/login?error=session_failed`);
        }
        // Redirect ke AuthSuccessPage dengan token
        const redirectUrl = `${CLIENT_URL}/auth/success?token=${token}&refreshToken=${refreshToken}`;
        res.redirect(redirectUrl);
      });
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
    }
  }
);

// Cek status login via session (opsional, untuk backward compat)
app.get("/api/auth/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false });
  }
});

// Logout session
app.get("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout gagal' });
    req.session.destroy();
    res.json({ message: 'Logged out' });
  });
});

// ─────────────────────────────────────────
// REST API ROUTES
// ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: 5050 });
});
app.get('/', (req, res) => {
    res.send('Server Backend Fintrix Berjalan Normal! 🚀');
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`🚀 Fintrix Server running on port ${PORT}`);
  console.log(`   Google OAuth: http://localhost:${PORT}/api/auth/google`);
  console.log(`   REST API:     http://localhost:${PORT}/api/...`);
});
module.exports = app;