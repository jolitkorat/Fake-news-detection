const axios = require('axios');
const crypto = require('crypto');
const Webhook = require('../models/Webhook');
const logger = require('../utils/logger');

/**
 * Deliver webhook payload to registered endpoints
 */
const deliverWebhook = async (userId, event, payload) => {
  try {
    const webhooks = await Webhook.findOne({
      userId,
      events: { $in: [event] },
      isActive: true,
    }).select('+secret');

    if (!webhooks) return;

    const webhookList = Array.isArray(webhooks) ? webhooks : [webhooks];

    for (const webhook of webhookList) {
      const body = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      });

      // HMAC signature for verification
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(body)
        .digest('hex');

      try {
        const response = await axios.post(webhook.url, body, {
          headers: {
            'Content-Type': 'application/json',
            'X-TruthLens-Signature': `sha256=${signature}`,
            'X-TruthLens-Event': event,
            'User-Agent': 'TruthLens-AI/1.0',
          },
          timeout: 10000,
        });

        await Webhook.findByIdAndUpdate(webhook._id, {
          lastTriggered: new Date(),
          $push: {
            deliveryLog: {
              event,
              statusCode: response.status,
              timestamp: new Date(),
              success: true,
              $slice: -50, // Keep last 50 entries
            },
          },
        });

        logger.info(`Webhook delivered: ${event} to ${webhook.url} (${response.status})`);
      } catch (deliveryError) {
        await Webhook.findByIdAndUpdate(webhook._id, {
          $inc: { failureCount: 1 },
          $push: {
            deliveryLog: {
              event,
              statusCode: deliveryError.response?.status || 0,
              timestamp: new Date(),
              success: false,
            },
          },
        });
        logger.error(`Webhook delivery failed: ${webhook.url} - ${deliveryError.message}`);

        // Disable webhook after 10 consecutive failures
        if (webhook.failureCount >= 9) {
          await Webhook.findByIdAndUpdate(webhook._id, { isActive: false });
          logger.warn(`Webhook disabled due to repeated failures: ${webhook._id}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Webhook service error: ${error.message}`);
  }
};

module.exports = { deliverWebhook };
