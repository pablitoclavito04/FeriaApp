const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = await Usuario.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'No autorizado, token inválido' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado, no hay token' });
  }
};

module.exports = { protect };