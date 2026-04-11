const Concert = require('../models/Concert');

// @desc    Get all concerts
// @route   GET /api/concerts
// @access  Public
const getConcerts = async (req, res) => {
  try {
    const concerts = await Concert.find().populate('caseta', 'name number');
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get concerts by caseta
// @route   GET /api/concerts/caseta/:casetaId
// @access  Public
const getConcertsByCaseta = async (req, res) => {
  try {
    const concerts = await Concert.find({ caseta: req.params.casetaId }).populate('caseta', 'name number');
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create a concert
// @route   POST /api/concerts
// @access  Private
const createConcert = async (req, res) => {
  try {
    const concert = await Concert.create(req.body);
    res.status(201).json(concert);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update a concert
// @route   PUT /api/concerts/:id
// @access  Private
const updateConcert = async (req, res) => {
  try {
    const concert = await Concert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!concert) {
      return res.status(404).json({ error: 'Concert not found' });
    }
    res.json(concert);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a concert
// @route   DELETE /api/concerts/:id
// @access  Private
const deleteConcert = async (req, res) => {
  try {
    const concert = await Concert.findByIdAndDelete(req.params.id);
    if (!concert) {
      return res.status(404).json({ error: 'Concert not found' });
    }
    res.json({ message: 'Concert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getConcerts, getConcertsByCaseta, createConcert, updateConcert, deleteConcert };