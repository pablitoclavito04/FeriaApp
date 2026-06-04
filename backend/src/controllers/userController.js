const User = require('../models/User');

// @desc    List all users except the requester (admin can't act on themselves)
// @route   GET /api/users
// @access  Private (admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ createdAt: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Change a user's role
// @route   PUT /api/users/:id/role
// @access  Private (admin)
const updateUserRole = async (req, res) => {
  try {
    // An admin cannot change their own role (avoids self-lockout).
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({ error: 'You cannot change your own role', code: 'FORBIDDEN' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    res.json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUser = async (req, res) => {
  try {
    // An admin cannot delete their own account.
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({ error: 'You cannot delete your own account', code: 'FORBIDDEN' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser };
