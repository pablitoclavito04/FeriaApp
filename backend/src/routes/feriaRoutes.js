const express = require('express');
const router = express.Router();
const {
  getFerias,
  getFeria,
  crearFeria,
  actualizarFeria,
  eliminarFeria,
} = require('../controllers/feriaController');
const { protect } = require('../middlewares/auth');

router.get('/', getFerias);
router.get('/:id', getFeria);
router.post('/', protect, crearFeria);
router.put('/:id', protect, actualizarFeria);
router.delete('/:id', protect, eliminarFeria);

module.exports = router;