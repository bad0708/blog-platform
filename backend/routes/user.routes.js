const express = require('express');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');
const { body, param } = require('express-validator');

const router = express.Router();

// Validation for user ID
const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  handleValidationErrors
];

// Validation for role update
const updateRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['AUTHOR', 'ADMIN'])
    .withMessage('Role must be AUTHOR or ADMIN'),
  handleValidationErrors
];

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt
    }
  });
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Transform _id to id for consistency with auth routes
    const transformedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    res.json({ users: transformedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin)
router.put('/:id/role', authenticate, requireAdmin, updateRoleValidation, async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from demoting themselves
    if (req.user._id.toString() === user._id.toString() && role !== 'ADMIN') {
      return res.status(400).json({ message: 'Cannot change your own admin role' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, requireAdmin, userIdValidation, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;