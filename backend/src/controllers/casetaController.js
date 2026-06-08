const Caseta = require('../models/Caseta');
const Fair = require('../models/Fair');
const path = require('path');
const { runAIDetection } = require('../services/detectCasetasAI');
const { remapLocation, sanitizeCrop, cropImageFile } = require('../services/cropMap');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    res.status(204).send();
  } catch (error) {
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Delete all casetas (optionally scoped to a fair)
// @route   DELETE /api/casetas
// @access  Private (admin)
const deleteAllCasetas = async (req, res) => {
  try {
    const filter = {};
    if (req.query.fair) filter.fair = req.query.fair;
    const result = await Caseta.deleteMany(filter);
    res.json({ deleted: result.deletedCount });
  } catch (error) {
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
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
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Detect casetas from an uploaded fair map (AI vision, adapts to any map)
// @route   POST /api/casetas/detect
// @access  Private (admin)
const detectCasetasFromMap = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Map image is required', code: 'VALIDATION_ERROR' });
  }
  try {
    const imagePath = path.resolve(req.file.path);
    const { width, height, casetas, mapArea } = await runAIDetection(imagePath);
    res.json({
      mapUrl: `/uploads/${req.file.filename}`,
      imageSize: { width, height },
      // Leaflet bounds in the existing convention: [[0,0],[height,width]].
      bounds: [[0, 0], [height, width]],
      expectedCount: casetas.length,
      // Suggested crop region (pixels) = the detected map area without legend.
      mapArea,
      casetas,
    });
  } catch (error) {
    if (error.code === 'AI_NO_KEY') {
      return res.status(503).json({ error: 'AI detection is not configured on the server', code: 'AI_NO_KEY' });
    }
    if (error.code === 'AI_TIMEOUT') {
      return res.status(504).json({ error: 'AI detection timed out', code: 'AI_TIMEOUT' });
    }
    if (error.code === 'AI_FAILED') {
      return res.status(500).json({ error: 'AI detection failed', code: 'AI_FAILED' });
    }
    res.status(500).json({ error: 'Detection failed', code: 'DETECT_FAILED' });
  }
};

// @desc    Bulk create/update casetas (e.g. after reviewing map detection)
// @route   POST /api/casetas/bulk
// @access  Private (admin)
const bulkCreateCasetas = async (req, res) => {
  try {
    let { casetas, mapImage, mapBounds } = req.body;
    // Optional crop: { crop: {x,y,width,height} in original pixels, originalHeight }.
    // When present, crop the published map to that region and re-express each
    // caseta location against the cropped image; casetas outside it are dropped.
    const { crop } = req.body;

    // Resolve the target fair: explicit id, else the active one.
    const fair = req.body.fair
      ? await Fair.findById(req.body.fair)
      : await Fair.findOne({ active: true });
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found', code: 'FAIR_NOT_FOUND' });
    }

    // Apply the crop before validating numbers, so dropped casetas don't trigger
    // spurious duplicate/validation checks.
    if (crop && mapImage && mapBounds && mapBounds.width && mapBounds.height) {
      const safe = sanitizeCrop(crop, mapBounds.width, mapBounds.height);
      if (safe) {
        const originalHeight = mapBounds.height;
        const filename = path.basename(mapImage);
        try {
          const out = await cropImageFile(UPLOADS_DIR, filename, safe);
          mapImage = `/uploads/${out.filename}`;
          mapBounds = { width: out.width, height: out.height };
          casetas = casetas
            .map((c) => {
              const loc = remapLocation(c.location, originalHeight, safe);
              return loc ? { ...c, location: loc } : null;
            })
            .filter(Boolean);
        } catch (err) {
          return res.status(500).json({ error: 'Could not crop the map image', code: 'CROP_FAILED' });
        }
      }
    }

    if (casetas.length === 0) {
      return res.status(422).json({
        error: 'No casetas remain after cropping (all fell outside the selected region)',
        code: 'VALIDATION_ERROR',
      });
    }

    // Reject duplicate numbers within the payload before writing anything.
    const numbers = casetas.map((c) => c.number);
    const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
    if (duplicates.length > 0) {
      return res.status(422).json({
        error: `Duplicate caseta numbers in payload: ${[...new Set(duplicates)].join(', ')}`,
        code: 'VALIDATION_ERROR',
      });
    }

    let created = 0;
    let updated = 0;
    for (const c of casetas) {
      const providedName = c.name && c.name.trim() ? c.name.trim() : null;
      const setFields = { location: { x: c.location.x, y: c.location.y } };
      const setOnInsert = { number: c.number, fair: fair._id };
      if (providedName) {
        // A name was typed: overwrite it on existing casetas too.
        setFields.name = providedName;
      } else {
        // No name: default only on insert; keep existing name on update.
        setOnInsert.name = `Caseta ${c.number}`;
      }
      const result = await Caseta.updateOne(
        { number: c.number, fair: fair._id },
        { $set: setFields, $setOnInsert: setOnInsert },
        { upsert: true }
      );
      if (result.upsertedCount) created += 1;
      else if (result.modifiedCount) updated += 1;
    }

    // Associate the map (and its bounds) the casetas were detected on with the
    // fair, so the public web renders markers on the right image.
    if (mapImage) {
      fair.mapImage = mapImage;
      if (mapBounds) fair.mapBounds = { width: mapBounds.width, height: mapBounds.height };
      await fair.save();
    }

    res.status(201).json({ created, updated, total: casetas.length });
  } catch (error) {
    /* istanbul ignore next */
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(422).json({ error: error.message, code: 'VALIDATION_ERROR' });
    }
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

module.exports = {
  getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta, deleteAllCasetas,
  detectCasetasFromMap, bulkCreateCasetas,
  searchCasetas, getCasetasSortedDesc, getCasetasWithImage, getCasetasWithoutImage,
  getHighestCaseta, getCasetasWithLocation, getCasetaFull, countCasetasByFair,
  getCasetaMenus, getCasetaConcerts,
  getCasetaCheapestMenu, getCasetaMostExpensiveMenu, getCasetaMenusSortedByPrice,
  getCasetaMenusCount, getCasetaUpcomingConcerts, getCasetaConcertsByGenre,
  getCasetaConcertsSortedDesc, getCasetaConcertsCount, getCasetaStats
};