require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimit');

// Route imports
const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const adminRoutes = require('./routes/admin');
const developerRoutes = require('./routes/developer');
const newsRoutes = require('./routes/news');

const app = express();

// Connect to MongoDB
connectDB();

// =====================
// SECURITY MIDDLEWARE
// =====================
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(mongoSanitize());

// =====================
// CORS
// =====================
app.use(cors({
  origin: [
    ...(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// =====================
// BODY PARSING
// =====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================
// LOGGING
// =====================
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// =====================
// RATE LIMITING
// =====================
app.use('/api/', generalLimiter);

// =====================
// HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// =====================
// API ROUTES
// =====================
app.use('/api/auth', authRoutes);
app.use('/api', analysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', developerRoutes);
app.use('/api/news', newsRoutes);

// =====================
// API DOCS INFO
// =====================
app.get('/api', (req, res) => {
  res.json({
    name: 'TruthLens AI API',
    version: '1.0.0',
    description: 'Fake News Detection Platform API',
    docs: '/api/docs',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Create account',
        'POST /api/auth/login': 'Login',
        'POST /api/auth/refresh': 'Refresh token',
        'GET /api/auth/me': 'Get profile',
      },
      analysis: {
        'POST /api/analyze': 'Analyze news content',
        'POST /api/scrape': 'Scrape article data from a URL',
        'POST /api/bulk-analyze': 'Batch analysis',
        'GET /api/report/:id': 'Get report',
        'GET /api/history': 'Analysis history',
        'GET /api/stats': 'User statistics',
      },
      news: {
        'POST /api/news/check-fake-news': 'Check if news is fake using Anakin Search API',
        'POST /api/news/batch-check': 'Batch check multiple news items',
        'GET /api/news/trusted-domains': 'Get list of trusted news domains',
      },
      developer: {
        'POST /api/keys/generate': 'Generate API key',
        'GET /api/keys': 'List API keys',
        'DELETE /api/keys/:id': 'Revoke API key',
        'POST /api/webhooks': 'Register webhook',
        'GET /api/webhooks': 'List webhooks',
      },
      admin: {
        'GET /api/admin/stats': 'System statistics',
        'GET /api/admin/users': 'List users',
        'PATCH /api/admin/users/:id': 'Update user',
        'DELETE /api/admin/users/:id': 'Delete user',
      },
    },
  });
});

// =====================
// 404 HANDLER
// =====================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// =====================
// GLOBAL ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`TruthLens AI Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});

module.exports = app;
