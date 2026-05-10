const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiKey',
      default: null,
    },
    inputType: {
      type: String,
      enum: ['text', 'url', 'api'],
      required: true,
    },
    originalContent: {
      headline: { type: String, default: '' },
      body: { type: String, default: '' },
      url: { type: String, default: null },
      author: { type: String, default: null },
      publishedAt: { type: Date, default: null },
      language: { type: String, default: 'en' },
    },
    verdict: {
      type: String,
      enum: ['Fake', 'Misleading', 'Partially True', 'Verified', 'Unverifiable'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    reasoning: [
      {
        type: String,
      },
    ],
    trustedSources: [
      {
        name: String,
        url: String,
        relevance: Number,
      },
    ],
    nlpAnalysis: {
      sentiment: {
        label: { type: String, enum: ['positive', 'negative','neutral'] },
        score: Number,
      },
      entities: [
        new mongoose.Schema(
          {
            text: String,
            entityType: { type: String, default: 'OTHER' }, // renamed from 'type' to avoid Mongoose keyword conflict
            salience: { type: Number, default: 0.3 },
          },
          { _id: false }
        ),
      ],
      propagandaScore: { type: Number, default: 0 },
      clickbaitScore: { type: Number, default: 0 },
      biasScore: { type: Number, default: 0 },
      headlineConsistency: { type: Number, default: 100 },
      readabilityScore: { type: Number, default: 0 },
    },
    factCheckResults: [
      {
        claimText: String,
        rating: String,
        source: String,
        url: String,
      },
    ],
    processingTime: {
      type: Number, // milliseconds
      default: 0,
    },
    model: {
      type: String,
      default: 'gpt-4o',
    },
    isBulk: {
      type: Boolean,
      default: false,
    },
    bulkJobId: {
      type: String,
      default: null,
    },
    webhookDelivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ verdict: 1 });
analysisSchema.index({ 'originalContent.url': 1 });
analysisSchema.index({ bulkJobId: 1 });
analysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
