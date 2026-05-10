const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'developer'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    analysisCount: {
      type: Number,
      default: 0,
    },
    monthlyAnalysisCount: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: API keys
userSchema.virtual('apiKeys', {
  ref: 'ApiKey',
  localField: '_id',
  foreignField: 'userId',
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get plan limits
userSchema.methods.getPlanLimits = function () {
  const limits = {
    free: { daily: 10, bulk: 0, history: 30 },
    pro: { daily: 200, bulk: 50, history: 365 },
    enterprise: { daily: -1, bulk: 500, history: -1 },
  };
  return limits[this.plan] || limits.free;
};

module.exports = mongoose.model('User', userSchema);
