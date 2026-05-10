const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'API key name is required'],
      trim: true,
      maxlength: 100,
    },
    keyPrefix: {
      type: String,
      required: true, // First 8 chars for display: "tl_live_abcd1234..."
    },
    keyHash: {
      type: String,
      required: true,
      select: false,
    },
    permissions: [
      {
        type: String,
        enum: ['analyze', 'bulk_analyze', 'read_reports', 'webhooks'],
      },
    ],
    rateLimit: {
      requestsPerHour: { type: Number, default: 100 },
      requestsPerDay: { type: Number, default: 1000 },
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null, // null = never expires
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowedIPs: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

apiKeySchema.index({ userId: 1 });
apiKeySchema.index({ keyHash: 1 });

// Static: generate a new API key
apiKeySchema.statics.generateKey = function () {
  const rawKey = `tl_live_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.substring(0, 16);
  return { rawKey, keyHash, keyPrefix };
};

// Static: verify an API key
apiKeySchema.statics.verifyKey = function (rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
