const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpire: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    // Profile fields
    phone: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'IDR',
    },
    language: {
      type: String,
      default: 'id',
    },
    notificationEmail: {
      type: Boolean,
      default: true,
    },
    notificationPush: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Hash password before saving ───────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare entered password with hashed password ─────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Check if account is locked ────────────────────────────────────────────
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// ─── Increment login attempts & lock if exceeded ───────────────────────────
userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  this.loginAttempts += 1;

  if (this.loginAttempts >= MAX_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_DURATION);
  }

  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;