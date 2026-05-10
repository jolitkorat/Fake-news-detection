const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Webhook URL is required'],
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    events: [
      {
        type: String,
        enum: ['analysis.completed', 'analysis.failed', 'bulk.completed'],
      },
    ],
    secret: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggered: {
      type: Date,
      default: null,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    deliveryLog: [
      {
        event: String,
        statusCode: Number,
        timestamp: Date,
        success: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

webhookSchema.index({ userId: 1 });

module.exports = mongoose.model('Webhook', webhookSchema);
