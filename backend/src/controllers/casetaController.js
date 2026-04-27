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
    const casetaData = { ...req.body };
    if (req.file) {
      casetaData.image = `/uploads/${req.file.filename}`;
    }
    const caseta = await Caseta.create(casetaData);
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
    const casetaData = { ...req.body };
    if (req.file) {
      casetaData.image = `/uploads/${req.file.filename}`;
    }
    const caseta = await Caseta.findByIdAndUpdate(req.params.id, casetaData, {
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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
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
    if (!caseta) return res.status(404).json({ error: 'No casetas found' });
    res.json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
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
    if (!caseta) return res.status(404).json({ error: 'Caseta not found' });
    const menus = await Menu.find({ caseta: req.params.id }).sort({ name: 1 });
    const concerts = await Concert.find({ caseta: req.params.id }).sort({ date: 1, time: 1 });
    res.json({ caseta, menus, concerts });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta,
  searchCasetas, getCasetasSortedDesc, getCasetasWithImage, getCasetasWithoutImage,
  getHighestCaseta, getCasetasWithLocation, getCasetaFull, countCasetasByFair
};