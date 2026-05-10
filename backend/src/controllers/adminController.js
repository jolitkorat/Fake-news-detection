const User = require('../models/User');
const Analysis = require('../models/Analysis');
const ApiKey = require('../models/ApiKey');
const logger = require('../utils/logger');

// GET /api/admin/stats
const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAnalyses,
      analysesToday,
      verdictStats,
      usersByPlan,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      Analysis.countDocuments(),
      Analysis.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Analysis.aggregate([
        { $group: { _id: '$verdict', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      Analysis.find()
        .select('verdict confidence createdAt originalContent.headline')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const distribution = { Fake: 0, Misleading: 0, 'Partially True': 0, Verified: 0, Unverifiable: 0 };
    verdictStats.forEach((s) => { distribution[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        users: { total: totalUsers },
        analyses: { total: totalAnalyses, today: analysesToday },
        verdictDistribution: distribution,
        usersByPlan,
        recentActivity,
      },
    });
  } catch (error) {
    logger.error(`Admin stats error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to get system stats' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { users, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
};

// PATCH /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { role, plan, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, plan, isActive },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

module.exports = { getSystemStats, getUsers, updateUser, deleteUser };
