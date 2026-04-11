const Fair = require('../models/Fair');

// @desc    Get all fairs
// @route   GET /api/fairs
// @access  Public
const getFairs = async (req, res) => {
  try {
    const fairs = await Fair.find();
    res.json(fairs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get a fair by ID
// @route   GET /api/fairs/:id
// @access  Public
const getFair = async (req, res) => {
  try {
    const fair = await Fair.findById(req.params.id);
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found' });
    }
    res.json(fair);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create a fair
// @route   POST /api/fairs
// @access  Private
const createFair = async (req, res) => {
  try {
    const fair = await Fair.create(req.body);
    res.status(201).json(fair);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update a fair
// @route   PUT /api/fairs/:id
// @access  Private
const updateFair = async (req, res) => {
  try {
    const fair = await Fair.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found' });
    }
    res.json(fair);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a fair
// @route   DELETE /api/fairs/:id
// @access  Private
const deleteFair = async (req, res) => {
  try {
    const fair = await Fair.findByIdAndDelete(req.params.id);
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found' });
    }
    res.json({ message: 'Fair deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getFairs, getFair, createFair, updateFair, deleteFair };