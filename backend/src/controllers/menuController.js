const Menu = require('../models/Menu');

// @desc    Obtener todos los menús
// @route   GET /api/menus
// @access  Public
const getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate('caseta', 'nombre numero');
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Obtener menús de una caseta
// @route   GET /api/menus/caseta/:casetaId
// @access  Public
const getMenusCaseta = async (req, res) => {
  try {
    const menus = await Menu.find({ caseta: req.params.casetaId }).populate('caseta', 'nombre numero');
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Crear un plato del menú
// @route   POST /api/menus
// @access  Private
const crearMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Actualizar un plato del menú
// @route   PUT /api/menus/:id
// @access  Private
const actualizarMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!menu) {
      return res.status(404).json({ error: 'Plato no encontrado' });
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Eliminar un plato del menú
// @route   DELETE /api/menus/:id
// @access  Private
const eliminarMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Plato no encontrado' });
    }
    res.json({ message: 'Plato eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { getMenus, getMenusCaseta, crearMenu, actualizarMenu, eliminarMenu };