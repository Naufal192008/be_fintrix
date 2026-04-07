require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { spawn } = require('child_process');

// Import Utils & Routes
const { generateToken, generateRefreshToken } = require('./src/utils/generateToken');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const investmentRoutes = require('./src/routes/investmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
// Catatan: aiRoutes sengaja tidak di-import di sini karena logikanya langsung ditaruh di bawah agar tidak bentrok.

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─────────────────────────────────────────
// DATABASE CONNECTION
// ─────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Fintrix DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// LAZY LOAD User model
let User;
const getUser = () => {
  if (!User) {
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
    secure: false, // Set true jika nanti portofoliomu online pakai HTTPS
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
        user = await UserModel.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0].value;
          user.isVerified = true;
          await user.save();
        } else {
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
// AI INSIGHT ROUTE (PINTU MASUK PYTHON)
// ─────────────────────────────────────────
app.get("/api/ai/insight", async (req, res) => {
  // Cek apakah user sudah login
  if (!req.user) return res.status(401).json({ message: "Unauthorized: Silahkan login dulu" });

  try {
    // 1. SIAPKAN DATA UNTUK PYTHON
    // Idealnya data ini ditarik dari MongoDB (Transaction & Goal model).
    // Sementara aku format statis agar sesuai EXACTLY dengan apa yang diminta financial_brain.py kamu.
    // Nanti kalau fitur transaksimu sudah jalan, tinggal ganti angka ini dengan hasil query DB.
    const userFinancialData = {
      balance: 15000000,  // Contoh Saldo
      expenses: 4500000,  // Contoh Pengeluaran bulan ini
      income: 8000000,    // Contoh Pemasukan bulan ini
      goals: [
        { title: "Beli Laptop Koding", target: 15000000, current: 2000000 },
        { title: "Dana Darurat", target: 10000000, current: 8000000 }
      ]
    };

    // 2. JALANKAN PYTHON
    const python = spawn('python', ['./financial_brain.py', JSON.stringify(userFinancialData)]);

    let result = "";
    python.stdout.on('data', (data) => { result += data.toString(); });
    
    python.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    python.on('close', (code) => {
      try { 
        res.json(JSON.parse(result)); 
      } catch (e) { 
        console.error("Gagal parse JSON dari Python:", result);
        res.status(500).json({ 
          error: "Terjadi kesalahan saat AI menganalisa data.", 
          raw: result 
        }); 
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────
app.get("/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

app.get("/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_failed`
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      req.session.save((err) => {
        if (err) return res.redirect(`${CLIENT_URL}/login?error=session_failed`);
        const redirectUrl = `${CLIENT_URL}/auth/success?token=${token}&refreshToken=${refreshToken}`;
        res.redirect(redirectUrl);
      });
    } catch (error) {
      res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
    }
  }
);

app.get("/api/auth/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false });
  }
});

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
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: 5050 });
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`🚀 Fintrix Server running on port ${PORT}`);
  console.log(`   Google OAuth: http://localhost:${PORT}/api/auth/google`);
  console.log(`   AI Engine:    http://localhost:${PORT}/api/ai/insight`);
});