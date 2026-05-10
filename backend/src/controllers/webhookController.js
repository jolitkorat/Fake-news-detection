const Webhook = require('../models/Webhook');
const crypto = require('crypto');

// POST /api/webhooks
const createWebhook = async (req, res) => {
  try {
    const { name, url, events } = req.body;
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await Webhook.create({
      userId: req.user._id,
      name,
      url,
      events,
      secret,
    });

    res.status(201).json({
      success: true,
      message: 'Webhook registered. Save the secret — it will not be shown again.',
      data: {
        id: webhook._id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        secret,
        createdAt: webhook.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create webhook' });
  }
};

// GET /api/webhooks
const listWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({ userId: req.user._id }).select('-secret');
    res.json({ success: true, data: webhooks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to list webhooks' });
  }
};

// DELETE /api/webhooks/:id
const deleteWebhook = async (req, res) => {
  try {
    await Webhook.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Webhook deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete webhook' });
  }
};

module.exports = { createWebhook, listWebhooks, deleteWebhook };
