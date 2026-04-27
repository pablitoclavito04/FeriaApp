const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menus
// @access  Public
const getMenus = async (req, res) => {
  try {
    const filter = {};
    if (req.query.caseta) filter.caseta = req.query.caseta;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const total = await Menu.countDocuments(filter);
    const menus = await Menu.find(filter)
      .populate('caseta', 'name number')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: menus,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menu items by caseta
// @route   GET /api/menus/caseta/:casetaId
// @access  Public
const getMenusByCaseta = async (req, res) => {
  try {
    const menus = await Menu.find({ caseta: req.params.casetaId }).populate('caseta', 'name number');
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Create a menu item
// @route   POST /api/menus
// @access  Private
const createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (error) {
   console.error('Error creating menu:', error.message);
   res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
  }
};

// @desc    Create multiple menu items at once for the same caseta
// @route   POST /api/menus/bulk
// @access  Private
const createMenusBulk = async (req, res) => {
  try {
    const { caseta, items } = req.body;

    if (!caseta) {
      return res.status(400).json({ error: 'Caseta is required', code: 'VALIDATION_ERROR' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one menu item is required', code: 'VALIDATION_ERROR' });
    }

    const docs = items.map((item) => ({
      name: item.name,
      description: item.description,
      price: item.price,
      caseta,
    }));

    const created = await Menu.insertMany(docs, { ordered: true });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating menus in bulk:', error.message);
    res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menus/:id
// @access  Private
const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!menu) {
      return res.status(404).json({ error: 'Menu item not found', code: 'MENU_NOT_FOUND' });
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menus/:id
// @access  Private
const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu item not found', code: 'MENU_NOT_FOUND' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Search menus by name
// @route   GET /api/menus/search/:name
// @access  Public
const searchMenus = async (req, res) => {
  try {
    const menus = await Menu.find({
      name: { $regex: req.params.name, $options: 'i' },
    }).populate('caseta', 'name number').sort({ name: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menus sorted by price ascending
// @route   GET /api/menus/sorted/price
// @access  Public
const getMenusSortedByPrice = async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate('caseta', 'name number')
      .sort({ price: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menus by price range
// @route   GET /api/menus/filter/price
// @access  Public
const getMenusByPriceRange = async (req, res) => {
  try {
    const min = parseFloat(req.query.min) || 0;
    const max = parseFloat(req.query.max) || 9999;
    const menus = await Menu.find({
      price: { $gte: min, $lte: max },
    }).populate('caseta', 'name number').sort({ price: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get most expensive menu item
// @route   GET /api/menus/filter/mostexpensive
// @access  Public
const getMostExpensiveMenu = async (req, res) => {
  try {
    const menu = await Menu.findOne()
      .populate('caseta', 'name number')
      .sort({ price: -1 });
    if (!menu) return res.status(404).json({ error: 'No menus found', code: 'MENU_NOT_FOUND' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get cheapest menu item
// @route   GET /api/menus/filter/cheapest
// @access  Public
const getCheapestMenu = async (req, res) => {
  try {
    const menu = await Menu.findOne()
      .populate('caseta', 'name number')
      .sort({ price: 1 });
    if (!menu) return res.status(404).json({ error: 'No menus found', code: 'MENU_NOT_FOUND' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menus without description
// @route   GET /api/menus/filter/nodescription
// @access  Public
const getMenusWithoutDescription = async (req, res) => {
  try {
    const menus = await Menu.find({
      $or: [{ description: { $exists: false } }, { description: null }, { description: '' }],
    }).populate('caseta', 'name number').sort({ name: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Count menus per caseta
// @route   GET /api/menus/count/bycaseta
// @access  Public
const countMenusByCaseta = async (req, res) => {
  try {
    const result = await Menu.aggregate([
      {
        $group: {
          _id: '$caseta',
          total: { $sum: 1 },
          avgPrice: { $avg: '$price' },
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
          avgPrice: { $round: ['$avgPrice', 2] },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

// @desc    Get menus with full caseta and fair info
// @route   GET /api/menus/filter/full
// @access  Public
const getMenusFull = async (req, res) => {
  try {
    const menus = await Menu.aggregate([
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
          name: 1,
          description: 1,
          price: 1,
          caseta: { $arrayElemAt: ['$casetaInfo.name', 0] },
          fair: { $arrayElemAt: ['$fairInfo.name', 0] },
        },
      },
      { $sort: { name: 1 } },
    ]);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
};

module.exports = {
  getMenus, getMenusByCaseta, createMenu, createMenusBulk, updateMenu, deleteMenu,
  searchMenus, getMenusSortedByPrice, getMenusByPriceRange, getMostExpensiveMenu,
  getCheapestMenu, getMenusWithoutDescription, countMenusByCaseta, getMenusFull
};