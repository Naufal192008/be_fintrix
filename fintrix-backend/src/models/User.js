require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");

// Import Models & Routes
const User = require('./src/models/User');
const transactionRoutes = require('./src/routes/transactionRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const investmentRoutes = require('./src/routes/investmentRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Fintrix DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Middleware
app.use(cors({
  origin: "http://localhost:5173", 
  methods: "GET,POST,PUT,DELETE",
  credentials: true, 
}));
app.use(express.json());

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

// Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5050/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          provider: 'google',
          isVerified: true
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// --- ROUTES ---

// Auth Routes
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));
app.get("/api/auth/google/callback", passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }), (req, res) => {
  req.session.save(() => res.redirect("http://localhost:5173/dashboard"));
});
app.get("/api/auth/login/success", (req, res) => {
  if (req.user) res.status(200).json({ success: true, user: req.user });
  else res.status(401).json({ success: false });
});

// Feature Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes); // Ini yang dipanggil Dashboard Admin

const PORT = 5050;
app.listen(PORT, () => console.log(`🚀 Fintrix Super Server running on port ${PORT}`));