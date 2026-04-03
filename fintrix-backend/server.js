require('dotenv').config()
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");

const app = express();

// 1. KONFIGURASI CORS (Credentials WAJIB true)
app.use(cors({
  origin: "http://localhost:5173", 
  methods: "GET,POST,PUT,DELETE",
  credentials: true, 
}));

app.use(express.json());

// 2. KONFIGURASI SESSION
app.use(session({
  secret: "fintrix_secret_key_2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set false untuk localhost
    httpOnly: true,
    sameSite: "lax", // WAJIB ada agar cookie tidak diblokir saat redirect antar port
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. STRATEGI GOOGLE OAUTH
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5050/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// --- ROUTES ---

// Login memicu daftar akun
app.get("/api/auth/google", 
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account" 
  })
);

// Callback dari Google
app.get("/api/auth/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: "http://localhost:5173/login" 
  }),
  (req, res) => {
    // FIX: Pastikan session tersimpan dulu baru pindah halaman
    req.session.save((err) => {
      if (err) return res.redirect("http://localhost:5173/login");
      res.redirect("http://localhost:5173/dashboard");
    });
  }
);

// Cek status login untuk Frontend
app.get("/api/auth/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false });
  }
});

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`🚀 Fintrix Auth Server is running on port ${PORT}`);
});