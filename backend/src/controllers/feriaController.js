const Feria = require('../models/Feria');

// @desc    Obtener todas las ferias
// @route   GET /api/ferias
// @access  Public
const getFerias = async (req, res) => {
  try {
    const ferias = await Feria.find();
    res.json(ferias);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Obtener una feria por ID
// @route   GET /api/ferias/:id
// @access  Public
const getFeria = async (req, res) => {
  try {
    const feria = await Feria.findById(req.params.id);
    if (!feria) {
      return res.status(404).json({ error: 'Feria no encontrada' });
    }
    res.json(feria);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Crear una feria
// @route   POST /api/ferias
// @access  Private
const crearFeria = async (req, res) => {
  try {
    const feria = await Feria.create(req.body);
    res.status(201).json(feria);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Actualizar una feria
// @route   PUT /api/ferias/:id
// @access  Private
const actualizarFeria = async (req, res) => {
  try {
    const feria = await Feria.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!feria) {
      return res.status(404).json({ error: 'Feria no encontrada' });
    }
    res.json(feria);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Eliminar una feria
// @route   DELETE /api/ferias/:id
// @access  Private
const eliminarFeria = async (req, res) => {
  try {
    const feria = await Feria.findByIdAndDelete(req.params.id);
    if (!feria) {
      return res.status(404).json({ error: 'Feria no encontrada' });
    }
    res.json({ message: 'Feria eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { getFerias, getFeria, crearFeria, actualizarFeria, eliminarFeria };