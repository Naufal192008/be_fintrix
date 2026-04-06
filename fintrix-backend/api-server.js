require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Import semua routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const investmentRoutes = require('./src/routes/investmentRoutes');

const app = express();

// ─────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/investments', investmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: 5000, message: 'Fintrix REST API is running 🚀' });
});

// ─────────────────────────────────────────
// START SERVER + CONNECT DB
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`🚀 Fintrix REST API running on port ${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   Auth:         http://localhost:${PORT}/api/auth`);
    console.log(`   Users:        http://localhost:${PORT}/api/users`);
    console.log(`   Transactions: http://localhost:${PORT}/api/transactions`);
    console.log(`   Analytics:    http://localhost:${PORT}/api/analytics`);
    console.log(`   Budgets:      http://localhost:${PORT}/api/budgets`);
    console.log(`   Investments:  http://localhost:${PORT}/api/investments`);
  });
}).catch((err) => {
  console.error('❌ Failed to connect to DB:', err);
  process.exit(1);
});
