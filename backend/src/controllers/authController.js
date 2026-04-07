const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// Generar token JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Login administrador
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Comprobar contraseña
    const passwordCorrecta = await usuario.compararPassword(password);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: generarToken(usuario._id),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Obtener perfil del administrador
// @route   GET /api/auth/perfil
// @access  Private
const getPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id).select('-password');
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { login, getPerfil };