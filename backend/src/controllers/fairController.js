const Fair = require('../models/Fair');

// @desc    Get all fairs
// @route   GET /api/fairs
// @access  Public
const getFairs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active) filter.active = req.query.active === 'true';

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const total = await Fair.countDocuments(filter);
    const fairs = await Fair.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ startDate: 1 });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: fairs,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get a fair by ID
// @route   GET /api/fairs/:id
// @access  Public
const getFair = async (req, res) => {
  try {
    const fair = await Fair.findById(req.params.id);
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found', code: 'FAIR_NOT_FOUND' });
    }
    res.json(fair);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
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
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
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
      return res.status(404).json({ error: 'Fair not found', code: 'FAIR_NOT_FOUND' });
    }
    res.json(fair);
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

// @desc    Delete a fair
// @route   DELETE /api/fairs/:id
// @access  Private
const deleteFair = async (req, res) => {
  try {
    const fair = await Fair.findByIdAndDelete(req.params.id);
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found', code: 'FAIR_NOT_FOUND' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get active fairs
// @route   GET /api/fairs/active
// @access  Public
const getActiveFairs = async (req, res) => {
  try {
    const fairs = await Fair.find({ active: true }).sort({ startDate: 1 });
    res.json(fairs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Search fairs by name
// @route   GET /api/fairs/search/:name
// @access  Public
const searchFairs = async (req, res) => {
  try {
    const fairs = await Fair.find({
      name: { $regex: req.params.name, $options: 'i' },
    }).sort({ startDate: 1 });
    res.json(fairs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get fairs by date range
// @route   GET /api/fairs/range
// @access  Public
const getFairsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate) filter.endDate = { $lte: new Date(endDate) };
    const fairs = await Fair.find(filter).sort({ startDate: 1 });
    res.json(fairs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get most recent fair
// @route   GET /api/fairs/latest
// @access  Public
const getLatestFair = async (req, res) => {
  try {
    const fair = await Fair.findOne().sort({ startDate: -1 });
    if (!fair) return res.status(404).json({ error: 'No fairs found', code: 'FAIR_NOT_FOUND' });
    res.json(fair);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get fair with its casetas
// @route   GET /api/fairs/:id/casetas
// @access  Public
const getFairWithCasetas = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const fair = await Fair.findById(req.params.id);
    if (!fair) return res.status(404).json({ error: 'Fair not found', code: 'FAIR_NOT_FOUND' });
    const casetas = await Caseta.find({ fair: req.params.id }).sort({ number: 1 });
    res.json({ fair, casetas });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Count active vs inactive fairs
// @route   GET /api/fairs/count/status
// @access  Public
const countFairsByStatus = async (req, res) => {
  try {
    const active = await Fair.countDocuments({ active: true });
    const inactive = await Fair.countDocuments({ active: false });
    res.json({ active, inactive, total: active + inactive });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get fairs sorted by end date descending
// @route   GET /api/fairs/sorted/enddate
// @access  Public
const getFairsSortedByEndDate = async (req, res) => {
  try {
    const fairs = await Fair.find().sort({ endDate: -1 });
    res.json(fairs);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get fair with full details (casetas, menus, concerts)
// @route   GET /api/fairs/:id/full
// @access  Public
const getFairFull = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const Menu = require('../models/Menu');
    const Concert = require('../models/Concert');

    const fair = await Fair.findById(req.params.id);
    if (!fair) return res.status(404).json({ error: 'Fair not found', code: 'FAIR_NOT_FOUND' });

    const casetas = await Caseta.find({ fair: req.params.id }).sort({ number: 1 });
    const casetaIds = casetas.map(c => c._id);
    const menus = await Menu.find({ caseta: { $in: casetaIds } }).populate('caseta', 'name number');
    const concerts = await Concert.find({ caseta: { $in: casetaIds } }).populate('caseta', 'name number').sort({ date: 1, time: 1 });

    res.json({ fair, casetas, menus, concerts });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get all menus of a fair
// @route   GET /api/fairs/:id/menus
// @access  Public
const getFairMenus = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const Menu = require('../models/Menu');
    const casetas = await Caseta.find({ fair: req.params.id }).select('_id');
    const casetaIds = casetas.map(c => c._id);
    const menus = await Menu.find({ caseta: { $in: casetaIds } })
      .populate('caseta', 'name number')
      .sort({ name: 1 });
    res.json(menus);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get all concerts of a fair
// @route   GET /api/fairs/:id/concerts
// @access  Public
const getFairConcerts = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const Concert = require('../models/Concert');
    const casetas = await Caseta.find({ fair: req.params.id }).select('_id');
    const casetaIds = casetas.map(c => c._id);
    const concerts = await Concert.find({ caseta: { $in: casetaIds } })
      .populate('caseta', 'name number')
      .sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get stats of a fair
// @route   GET /api/fairs/:id/stats
// @access  Public
const getFairStats = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const Menu = require('../models/Menu');
    const Concert = require('../models/Concert');
    const fair = await Fair.findById(req.params.id);
    if (!fair) return res.status(404).json({ error: 'Fair not found', code: 'FAIR_NOT_FOUND' });
    const casetas = await Caseta.find({ fair: req.params.id }).select('_id');
    const casetaIds = casetas.map(c => c._id);
    const totalMenus = await Menu.countDocuments({ caseta: { $in: casetaIds } });
    const totalConcerts = await Concert.countDocuments({ caseta: { $in: casetaIds } });
    const avgMenuPrice = await Menu.aggregate([
      { $match: { caseta: { $in: casetaIds } } },
      { $group: { _id: null, avg: { $avg: '$price' } } },
    ]);
    res.json({
      fair: fair.name,
      totalCasetas: casetas.length,
      totalMenus,
      totalConcerts,
      avgMenuPrice: avgMenuPrice[0] ? Math.round(avgMenuPrice[0].avg * 100) / 100 : 0,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Count casetas of a fair
// @route   GET /api/fairs/:id/casetas/count
// @access  Public
const getFairCasetasCount = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const total = await Caseta.countDocuments({ fair: req.params.id });
    res.json({ total });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get casetas with image of a fair
// @route   GET /api/fairs/:id/casetas/withimage
// @access  Public
const getFairCasetasWithImage = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const casetas = await Caseta.find({
      fair: req.params.id,
      image: { $exists: true, $ne: null, $ne: '' },
    }).sort({ number: 1 });
    res.json(casetas);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Search casetas of a fair by name
// @route   GET /api/fairs/:id/casetas/search/:name
// @access  Public
const getFairCasetasSearch = async (req, res) => {
  try {
    const Caseta = require('../models/Caseta');
    const casetas = await Caseta.find({
      fair: req.params.id,
      name: { $regex: req.params.name, $options: 'i' },
    }).sort({ number: 1 });
    res.json(casetas);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

module.exports = {
  getFairs, getFair, createFair, updateFair, deleteFair,
  getActiveFairs, searchFairs, getFairsByDateRange, getLatestFair,
  getFairWithCasetas, countFairsByStatus, getFairsSortedByEndDate, getFairFull,
  getFairMenus, getFairConcerts, getFairStats, getFairCasetasCount,
  getFairCasetasWithImage, getFairCasetasSearch
};