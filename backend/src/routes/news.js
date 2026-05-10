const express = require('express');
const router = express.Router();
const {
  checkFakeNews,
  batchCheckFakeNews,
  getTrustedDomains,
} = require('../controllers/newsController');
const { protect, requirePermission, optionalAuth } = require('../middleware/auth');
const { analysisLimiter, bulkLimiter } = require('../middleware/rateLimit');

/**
 * POST /api/news/check-fake-news
 * Check if news content is fake
 * Auth: JWT or API Key
 */
router.post(
  '/check-fake-news',
  protect,
  requirePermission('analyze'),
  analysisLimiter,
  checkFakeNews
);

/**
 * POST /api/news/batch-check
 * Batch check multiple news items
 * Auth: JWT or API Key
 */
router.post(
  '/batch-check',
  protect,
  requirePermission('bulk_analyze'),
  bulkLimiter,
  batchCheckFakeNews
);

/**
 * GET /api/news/trusted-domains
 * Get list of trusted news domains
 * Auth: Optional
 */
router.get(
  '/trusted-domains',
  optionalAuth,
  getTrustedDomains
);

module.exports = router;
