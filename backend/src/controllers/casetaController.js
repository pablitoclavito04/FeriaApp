const Caseta = require('../models/Caseta');

// @desc    Get all casetas
// @route   GET /api/casetas
// @access  Public
const getCasetas = async (req, res) => {
  try {
    const casetas = await Caseta.find().populate('fair', 'name');
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get a caseta by ID
// @route   GET /api/casetas/:id
// @access  Public
const getCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findById(req.params.id).populate('fair', 'name');
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta not found' });
    }
    res.json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create a caseta
// @route   POST /api/casetas
// @access  Private
const createCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.create(req.body);
    res.status(201).json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update a caseta
// @route   PUT /api/casetas/:id
// @access  Private
const updateCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta not found' });
    }
    res.json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a caseta
// @route   DELETE /api/casetas/:id
// @access  Private
const deleteCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findByIdAndDelete(req.params.id);
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta not found' });
    }
    res.json({ message: 'Caseta deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta };