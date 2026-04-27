const Caseta = require('../models/Caseta');
const path = require('path');

// @desc    Get all casetas
// @route   GET /api/casetas
// @access  Public
const getCasetas = async (req, res) => {
  try {
    const filter = {};
    if (req.query.fair) filter.fair = req.query.fair;
    if (req.query.number) filter.number = req.query.number;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const total = await Caseta.countDocuments(filter);
    const casetas = await Caseta.find(filter)
      .populate('fair', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ number: 1 });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: casetas,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get a caseta by ID
// @route   GET /api/casetas/:id
// @access  Public
const getCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findById(req.params.id).populate('fair', 'name');
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta not found', code: 'CASETA_NOT_FOUND' });
    }
    res.json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Create a caseta
// @route   POST /api/casetas
// @access  Private
const createCaseta = async (req, res) => {
  try {
    const casetaData = { ...req.body };
    if (req.file) {
      casetaData.image = `/uploads/${req.file.filename}`;
    }
    const caseta = await Caseta.create(casetaData);
    res.status(201).json(caseta);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Update a caseta
// @route   PUT /api/casetas/:id
// @access  Private
const updateCaseta = async (req, res) => {
  try {
    const casetaData = { ...req.body };
    if (req.file) {
      casetaData.image = `/uploads/${req.file.filename}`;
    }
    const caseta = await Caseta.findByIdAndUpdate(req.params.id, casetaData, {
      new: true,
      runValidators: true,
    });
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta not found', code: 'CASETA_NOT_FOUND' });
    }
    res.json(caseta);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Delete a caseta
// @route   DELETE /api/casetas/:id
// @access  Private
const deleteCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findByIdAndDelete(req.params.id);
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta not found', code: 'CASETA_NOT_FOUND' });
    }
    res.json({ message: 'Caseta deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Search casetas by name
// @route   GET /api/casetas/search/:name
// @access  Public
const searchCasetas = async (req, res) => {
  try {
    const casetas = await Caseta.find({
      name: { $regex: req.params.name, $options: 'i' },
    }).populate('fair', 'name').sort({ number: 1 });
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get casetas sorted by number descending
// @route   GET /api/casetas/sorted/desc
// @access  Public
const getCasetasSortedDesc = async (req, res) => {
  try {
    const casetas = await Caseta.find()
      .populate('fair', 'name')
      .sort({ number: -1 });
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get casetas with image
// @route   GET /api/casetas/filter/withimage
// @access  Public
const getCasetasWithImage = async (req, res) => {
  try {
    const casetas = await Caseta.find({
      image: { $exists: true, $ne: null, $ne: '' },
    }).populate('fair', 'name').sort({ number: 1 });
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get casetas without image
// @route   GET /api/casetas/filter/noimage
// @access  Public
const getCasetasWithoutImage = async (req, res) => {
  try {
    const casetas = await Caseta.find({
      $or: [{ image: { $exists: false } }, { image: null }, { image: '' }],
    }).populate('fair', 'name').sort({ number: 1 });
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get caseta with highest number
// @route   GET /api/casetas/filter/highest
// @access  Public
const getHighestCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findOne()
      .populate('fair', 'name')
      .sort({ number: -1 });
    if (!caseta) return res.status(404).json({ error: 'No casetas found', code: 'CASETA_NOT_FOUND' });
    res.json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get casetas with location defined
// @route   GET /api/casetas/filter/withlocation
// @access  Public
const getCasetasWithLocation = async (req, res) => {
  try {
    const casetas = await Caseta.find({
      'location.x': { $ne: null },
      'location.y': { $ne: null },
    }).populate('fair', 'name').sort({ number: 1 });
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get caseta with its menus and concerts
// @route   GET /api/casetas/:id/full
// @access  Public
const getCasetaFull = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const Concert = require('../models/Concert');
    const caseta = await Caseta.findById(req.params.id).populate('fair', 'name');
    if (!caseta) return res.status(404).json({ error: 'Caseta not found', code: 'CASETA_NOT_FOUND' });
    const menus = await Menu.find({ caseta: req.params.id }).sort({ name: 1 });
    const concerts = await Concert.find({ caseta: req.params.id }).sort({ date: 1, time: 1 });
    res.json({ caseta, menus, concerts });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Count casetas per fair
// @route   GET /api/casetas/count/byfair
// @access  Public
const countCasetasByFair = async (req, res) => {
  try {
    const result = await Caseta.aggregate([
      {
        $group: {
          _id: '$fair',
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'fairs',
          localField: '_id',
          foreignField: '_id',
          as: 'fairInfo',
        },
      },
      {
        $project: {
          _id: 0,
          fair: { $arrayElemAt: ['$fairInfo.name', 0] },
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menus by caseta (nested route)
// @route   GET /api/casetas/:id/menus
// @access  Public
const getCasetaMenus = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const menus = await Menu.find({ caseta: req.params.id })
      .populate('caseta', 'name number')
      .sort({ name: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts by caseta (nested route)
// @route   GET /api/casetas/:id/concerts
// @access  Public
const getCasetaConcerts = async (req, res) => {
  try {
    const Concert = require('../models/Concert');
    const concerts = await Concert.find({ caseta: req.params.id })
      .populate('caseta', 'name number')
      .sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get cheapest menu of a caseta
// @route   GET /api/casetas/:id/menus/cheapest
// @access  Public
const getCasetaCheapestMenu = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const menu = await Menu.findOne({ caseta: req.params.id })
      .populate('caseta', 'name number')
      .sort({ price: 1 });
    if (!menu) return res.status(404).json({ error: 'No menus found', code: 'MENU_NOT_FOUND' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get most expensive menu of a caseta
// @route   GET /api/casetas/:id/menus/mostexpensive
// @access  Public
const getCasetaMostExpensiveMenu = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const menu = await Menu.findOne({ caseta: req.params.id })
      .populate('caseta', 'name number')
      .sort({ price: -1 });
    if (!menu) return res.status(404).json({ error: 'No menus found', code: 'MENU_NOT_FOUND' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menus of a caseta sorted by price
// @route   GET /api/casetas/:id/menus/sorted/price
// @access  Public
const getCasetaMenusSortedByPrice = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const menus = await Menu.find({ caseta: req.params.id })
      .populate('caseta', 'name number')
      .sort({ price: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Count menus of a caseta
// @route   GET /api/casetas/:id/menus/count
// @access  Public
const getCasetaMenusCount = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const total = await Menu.countDocuments({ caseta: req.params.id });
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get upcoming concerts of a caseta
// @route   GET /api/casetas/:id/concerts/upcoming
// @access  Public
const getCasetaUpcomingConcerts = async (req, res) => {
  try {
    const Concert = require('../models/Concert');
    const concerts = await Concert.find({
      caseta: req.params.id,
      date: { $gte: new Date() },
    }).populate('caseta', 'name number').sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts of a caseta by genre
// @route   GET /api/casetas/:id/concerts/genre/:genre
// @access  Public
const getCasetaConcertsByGenre = async (req, res) => {
  try {
    const Concert = require('../models/Concert');
    const concerts = await Concert.find({
      caseta: req.params.id,
      genre: { $regex: req.params.genre, $options: 'i' },
    }).populate('caseta', 'name number').sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts of a caseta sorted by date descending
// @route   GET /api/casetas/:id/concerts/sorted/desc
// @access  Public
const getCasetaConcertsSortedDesc = async (req, res) => {
  try {
    const Concert = require('../models/Concert');
    const concerts = await Concert.find({ caseta: req.params.id })
      .populate('caseta', 'name number')
      .sort({ date: -1, time: -1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Count concerts of a caseta
// @route   GET /api/casetas/:id/concerts/count
// @access  Public
const getCasetaConcertsCount = async (req, res) => {
  try {
    const Concert = require('../models/Concert');
    const total = await Concert.countDocuments({ caseta: req.params.id });
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get stats of a caseta
// @route   GET /api/casetas/:id/stats
// @access  Public
const getCasetaStats = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const Concert = require('../models/Concert');
    const caseta = await Caseta.findById(req.params.id).populate('fair', 'name');
    if (!caseta) return res.status(404).json({ error: 'Caseta not found', code: 'CASETA_NOT_FOUND' });
    const totalMenus = await Menu.countDocuments({ caseta: req.params.id });
    const totalConcerts = await Concert.countDocuments({ caseta: req.params.id });
    const avgMenuPrice = await Menu.aggregate([
      { $match: { caseta: caseta._id } },
      { $group: { _id: null, avg: { $avg: '$price' }, min: { $min: '$price' }, max: { $max: '$price' } } },
    ]);
    res.json({
      caseta: caseta.name,
      fair: caseta.fair?.name,
      totalMenus,
      totalConcerts,
      avgMenuPrice: avgMenuPrice[0] ? Math.round(avgMenuPrice[0].avg * 100) / 100 : 0,
      minMenuPrice: avgMenuPrice[0]?.min || 0,
      maxMenuPrice: avgMenuPrice[0]?.max || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

module.exports = {
  getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta,
  searchCasetas, getCasetasSortedDesc, getCasetasWithImage, getCasetasWithoutImage,
  getHighestCaseta, getCasetasWithLocation, getCasetaFull, countCasetasByFair,
  getCasetaMenus, getCasetaConcerts,
  getCasetaCheapestMenu, getCasetaMostExpensiveMenu, getCasetaMenusSortedByPrice,
  getCasetaMenusCount, getCasetaUpcomingConcerts, getCasetaConcertsByGenre,
  getCasetaConcertsSortedDesc, getCasetaConcertsCount, getCasetaStats
};