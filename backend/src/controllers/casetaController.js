const Caseta = require('../models/Caseta');

// @desc    Obtener todas las casetas
// @route   GET /api/casetas
// @access  Public
const getCasetas = async (req, res) => {
  try {
    const casetas = await Caseta.find().populate('feria', 'nombre');
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Obtener una caseta por ID
// @route   GET /api/casetas/:id
// @access  Public
const getCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findById(req.params.id).populate('feria', 'nombre');
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta no encontrada' });
    }
    res.json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Crear una caseta
// @route   POST /api/casetas
// @access  Private
const crearCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.create(req.body);
    res.status(201).json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Actualizar una caseta
// @route   PUT /api/casetas/:id
// @access  Private
const actualizarCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta no encontrada' });
    }
    res.json(caseta);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Eliminar una caseta
// @route   DELETE /api/casetas/:id
// @access  Private
const eliminarCaseta = async (req, res) => {
  try {
    const caseta = await Caseta.findByIdAndDelete(req.params.id);
    if (!caseta) {
      return res.status(404).json({ error: 'Caseta no encontrada' });
    }
    res.json({ message: 'Caseta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { getCasetas, getCaseta, crearCaseta, actualizarCaseta, eliminarCaseta };