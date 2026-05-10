const express = require('express');
const router = express.Router();
const { getSystemStats, getUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect, requireAdmin);

router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
