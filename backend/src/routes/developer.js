const express = require('express');
const router = express.Router();
const { generateKey, listKeys, revokeKey } = require('../controllers/apiKeyController');
const { createWebhook, listWebhooks, deleteWebhook } = require('../controllers/webhookController');
const { protect } = require('../middleware/auth');

// API Keys
router.post('/keys/generate', protect, generateKey);
router.get('/keys', protect, listKeys);
router.delete('/keys/:id', protect, revokeKey);

// Webhooks
router.post('/webhooks', protect, createWebhook);
router.get('/webhooks', protect, listWebhooks);
router.delete('/webhooks/:id', protect, deleteWebhook);

module.exports = router;
