const express = require('express');
const router = express.Router();
const {
  getCasetas,
  getCaseta,
  crearCaseta,
  actualizarCaseta,
  eliminarCaseta,
} = require('../controllers/casetaController');
const { protect } = require('../middlewares/auth');

router.get('/', getCasetas);
router.get('/:id', getCaseta);
router.post('/', protect, crearCaseta);
router.put('/:id', protect, actualizarCaseta);
router.delete('/:id', protect, eliminarCaseta);

module.exports = router;