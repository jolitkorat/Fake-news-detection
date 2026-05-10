const express = require('express');
const router = express.Router();
const {
  analyze,
  scrapeData,
  bulkAnalyze,
  getReport,
  getHistory,
  getStats,
} = require('../controllers/analysisController');
const { protect, requirePermission, optionalAuth } = require('../middleware/auth');
const { analysisLimiter, bulkLimiter } = require('../middleware/rateLimit');

// Single analysis — JWT or API Key
router.post('/analyze', protect, requirePermission('analyze'), analysisLimiter, analyze);

// Scrape article content from URL — JWT or API Key
router.post('/scrape', protect, requirePermission('analyze'), analysisLimiter, scrapeData);

// Bulk analysis — API Key required
router.post('/bulk-analyze', protect, requirePermission('bulk_analyze'), bulkLimiter, bulkAnalyze);

// Get report by ID — JWT or API Key
router.get('/report/:id', protect, requirePermission('read_reports'), getReport);

// History — JWT only
router.get('/history', protect, getHistory);

// User stats
router.get('/stats', protect, getStats);

module.exports = router;
