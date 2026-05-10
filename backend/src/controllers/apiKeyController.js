const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

// POST /api/keys/generate
const generateKey = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    const { rawKey, keyHash, keyPrefix } = ApiKey.generateKey();

    const apiKey = await ApiKey.create({
      userId: req.user._id,
      name,
      keyPrefix,
      keyHash,
      permissions: permissions || ['analyze', 'read_reports'],
      description,
    });

    // Return raw key ONCE — not stored
    res.status(201).json({
      success: true,
      message: 'API key generated. Save it now — it will not be shown again.',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: rawKey,
        keyPrefix: apiKey.keyPrefix,
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate API key' });
  }
};

// GET /api/keys
const listKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user._id })
      .select('-keyHash')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: keys });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to list API keys' });
  }
};

// DELETE /api/keys/:id
const revokeKey = async (req, res) => {
  try {
    const key = await ApiKey.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!key) return res.status(404).json({ success: false, error: 'API key not found' });
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to revoke key' });
  }
};

module.exports = { generateKey, listKeys, revokeKey };
