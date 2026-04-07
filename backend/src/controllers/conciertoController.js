const Concierto = require('../models/Concierto');

// @desc    Obtener todos los conciertos
// @route   GET /api/conciertos
// @access  Public
const getConciertos = async (req, res) => {
  try {
    const conciertos = await Concierto.find().populate('caseta', 'nombre numero');
    res.json(conciertos);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Obtener conciertos de una caseta
// @route   GET /api/conciertos/caseta/:casetaId
// @access  Public
const getConciertosCC = async (req, res) => {
  try {
    const conciertos = await Concierto.find({ caseta: req.params.casetaId }).populate('caseta', 'nombre numero');
    res.json(conciertos);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Crear un concierto
// @route   POST /api/conciertos
// @access  Private
const crearConcierto = async (req, res) => {
  try {
    const concierto = await Concierto.create(req.body);
    res.status(201).json(concierto);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Actualizar un concierto
// @route   PUT /api/conciertos/:id
// @access  Private
const actualizarConcierto = async (req, res) => {
  try {
    const concierto = await Concierto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!concierto) {
      return res.status(404).json({ error: 'Concierto no encontrado' });
    }
    res.json(concierto);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Eliminar un concierto
// @route   DELETE /api/conciertos/:id
// @access  Private
const eliminarConcierto = async (req, res) => {
  try {
    const concierto = await Concierto.findByIdAndDelete(req.params.id);
    if (!concierto) {
      return res.status(404).json({ error: 'Concierto no encontrado' });
    }
    res.json({ message: 'Concierto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { getConciertos, getConciertosCC, crearConcierto, actualizarConcierto, eliminarConcierto };