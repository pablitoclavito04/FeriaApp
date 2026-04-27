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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
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
   res.status(500).json({ error: error.message });
  }
};

// @desc    Create multiple menu items at once for the same caseta
// @route   POST /api/menus/bulk
// @access  Private
const createMenusBulk = async (req, res) => {
  try {
    const { caseta, items } = req.body;

    if (!caseta) {
      return res.status(400).json({ error: 'Caseta is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one menu item is required' });
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
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menus/:id
// @access  Private
const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMenus, getMenusByCaseta, createMenu, createMenusBulk, updateMenu, deleteMenu };