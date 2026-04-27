const Concert = require('../models/Concert');

// @desc    Get all concerts
// @route   GET /api/concerts
// @access  Public
const getConcerts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.caseta) filter.caseta = req.query.caseta;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const total = await Concert.countDocuments(filter);
    const concerts = await Concert.find(filter)
      .populate('caseta', 'name number')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1, time: 1 });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: concerts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
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
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
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
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
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
      return res.status(404).json({ error: 'Concert not found', code: 'CONCERT_NOT_FOUND' });
    }
    res.json(concert);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Delete a concert
// @route   DELETE /api/concerts/:id
// @access  Private
const deleteConcert = async (req, res) => {
  try {
    const concert = await Concert.findByIdAndDelete(req.params.id);
    if (!concert) {
      return res.status(404).json({ error: 'Concert not found', code: 'CONCERT_NOT_FOUND' });
    }
    res.json({ message: 'Concert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Search concerts by artist
// @route   GET /api/concerts/search/:artist
// @access  Public
const searchConcerts = async (req, res) => {
  try {
    const concerts = await Concert.find({
      artist: { $regex: req.params.artist, $options: 'i' },
    }).populate('caseta', 'name number').sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts sorted by date descending
// @route   GET /api/concerts/sorted/desc
// @access  Public
const getConcertsSortedDesc = async (req, res) => {
  try {
    const concerts = await Concert.find()
      .populate('caseta', 'name number')
      .sort({ date: -1, time: -1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts by date range
// @route   GET /api/concerts/filter/daterange
// @access  Public
const getConcertsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
    const concerts = await Concert.find(filter)
      .populate('caseta', 'name number')
      .sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts by genre
// @route   GET /api/concerts/filter/genre/:genre
// @access  Public
const getConcertsByGenre = async (req, res) => {
  try {
    const concerts = await Concert.find({
      genre: { $regex: req.params.genre, $options: 'i' },
    }).populate('caseta', 'name number').sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get upcoming concerts
// @route   GET /api/concerts/filter/upcoming
// @access  Public
const getUpcomingConcerts = async (req, res) => {
  try {
    const concerts = await Concert.find({
      date: { $gte: new Date() },
    }).populate('caseta', 'name number').sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Count concerts per caseta
// @route   GET /api/concerts/count/bycaseta
// @access  Public
const countConcertsByCaseta = async (req, res) => {
  try {
    const result = await Concert.aggregate([
      {
        $group: {
          _id: '$caseta',
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'casetas',
          localField: '_id',
          foreignField: '_id',
          as: 'casetaInfo',
        },
      },
      {
        $project: {
          _id: 0,
          caseta: { $arrayElemAt: ['$casetaInfo.name', 0] },
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

// @desc    Get concerts with no genre defined
// @route   GET /api/concerts/filter/nogenre
// @access  Public
const getConcertsWithoutGenre = async (req, res) => {
  try {
    const concerts = await Concert.find({
      $or: [{ genre: { $exists: false } }, { genre: null }, { genre: '' }],
    }).populate('caseta', 'name number').sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts with full caseta and fair info
// @route   GET /api/concerts/filter/full
// @access  Public
const getConcertsFull = async (req, res) => {
  try {
    const concerts = await Concert.aggregate([
      {
        $lookup: {
          from: 'casetas',
          localField: 'caseta',
          foreignField: '_id',
          as: 'casetaInfo',
        },
      },
      {
        $lookup: {
          from: 'fairs',
          localField: 'casetaInfo.fair',
          foreignField: '_id',
          as: 'fairInfo',
        },
      },
      {
        $project: {
          artist: 1,
          genre: 1,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          time: 1,
          caseta: { $arrayElemAt: ['$casetaInfo.name', 0] },
          fair: { $arrayElemAt: ['$fairInfo.name', 0] },
        },
      },
      { $sort: { date: 1, time: 1 } },
    ]);
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get caseta of a concert
// @route   GET /api/concerts/:id/caseta
// @access  Public
const getConcertCaseta = async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id).populate('caseta');
    if (!concert) return res.status(404).json({ error: 'Concert not found', code: 'CONCERT_NOT_FOUND' });
    res.json(concert.caseta);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts on the same day
// @route   GET /api/concerts/:id/sameday
// @access  Public
const getConcertsSameDay = async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).json({ error: 'Concert not found', code: 'CONCERT_NOT_FOUND' });
    const startOfDay = new Date(concert.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(concert.date);
    endOfDay.setHours(23, 59, 59, 999);
    const concerts = await Concert.find({
      _id: { $ne: concert._id },
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate('caseta', 'name number').sort({ time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get concerts of the same genre
// @route   GET /api/concerts/:id/samegenre
// @access  Public
const getConcertsSameGenre = async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).json({ error: 'Concert not found', code: 'CONCERT_NOT_FOUND' });
    if (!concert.genre) return res.json([]);
    const concerts = await Concert.find({
      _id: { $ne: concert._id },
      genre: { $regex: concert.genre, $options: 'i' },
    }).populate('caseta', 'name number').sort({ date: 1, time: 1 });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menus of the caseta of a concert
// @route   GET /api/concerts/:id/caseta/menus
// @access  Public
const getConcertCasetaMenus = async (req, res) => {
  try {
    const Menu = require('../models/Menu');
    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).json({ error: 'Concert not found', code: 'CONCERT_NOT_FOUND' });
    const menus = await Menu.find({ caseta: concert.caseta })
      .populate('caseta', 'name number')
      .sort({ name: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

module.exports = {
  getConcerts, getConcertsByCaseta, createConcert, updateConcert, deleteConcert,
  searchConcerts, getConcertsSortedDesc, getConcertsByDateRange, getConcertsByGenre,
  getUpcomingConcerts, countConcertsByCaseta, getConcertsWithoutGenre, getConcertsFull,
  getConcertCaseta, getConcertsSameDay, getConcertsSameGenre, getConcertCasetaMenus
};