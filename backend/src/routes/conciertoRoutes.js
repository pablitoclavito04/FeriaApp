const express = require('express');
const router = express.Router();
const {
  getConciertos,
  getConciertosCC,
  crearConcierto,
  actualizarConcierto,
  eliminarConcierto,
} = require('../controllers/conciertoController');
const { protect } = require('../middlewares/auth');

router.get('/', getConciertos);
router.get('/caseta/:casetaId', getConciertosCC);
router.post('/', protect, crearConcierto);
router.put('/:id', protect, actualizarConcierto);
router.delete('/:id', protect, eliminarConcierto);

module.exports = router;