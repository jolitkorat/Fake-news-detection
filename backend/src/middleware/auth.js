const jwt = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const logger = require('../utils/logger');

// Verify JWT token
const verifyJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
};

// Verify API Key
const verifyApiKey = async (rawKey) => {
  try {
    const keyHash = ApiKey.verifyKey(rawKey);
    const apiKey = await ApiKey.findOne({ keyHash, isActive: true }).populate('userId');
    if (!apiKey) return null;
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return null;
    if (!apiKey.userId || !apiKey.userId.isActive) return null;
    // Update usage stats
    await ApiKey.findByIdAndUpdate(apiKey._id, {
      $inc: { usageCount: 1 },
      lastUsed: new Date(),
    });
    return { user: apiKey.userId, apiKey };
  } catch {
    return null;
  }
};

// Middleware: require JWT or API Key
const protect = async (req, res, next) => {
  try {
    let token = null;
    let authMethod = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      authMethod = 'jwt';
    }

    // Check x-api-key header
    const apiKeyHeader = req.headers['x-api-key'];
    if (apiKeyHeader) {
      authMethod = 'apikey';
    }

    if (authMethod === 'jwt') {
      const user = await verifyJWT(token);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }
      req.user = user;
      req.authMethod = 'jwt';
    } else if (authMethod === 'apikey') {
      const result = await verifyApiKey(apiKeyHeader);
      if (!result) {
        return res.status(401).json({ success: false, error: 'Invalid or expired API key' });
      }
      req.user = result.user;
      req.apiKey = result.apiKey;
      req.authMethod = 'apikey';
    } else {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

// Middleware: require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// Middleware: require specific API key permission
const requirePermission = (permission) => (req, res, next) => {
  if (req.authMethod === 'jwt') return next(); // JWT users have all permissions
  if (!req.apiKey || !req.apiKey.permissions.includes(permission)) {
    return res.status(403).json({ success: false, error: `Permission '${permission}' required` });
  }
  next();
};

// Optional auth (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const user = await verifyJWT(token);
      if (user) req.user = user;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { protect, requireAdmin, requirePermission, optionalAuth };
