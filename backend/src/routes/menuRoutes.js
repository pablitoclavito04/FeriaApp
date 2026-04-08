const express = require('express');
const router = express.Router();
const {
  getMenus,
  getMenusCaseta,
  crearMenu,
  actualizarMenu,
  eliminarMenu,
} = require('../controllers/menuController');
const { protect } = require('../middlewares/auth');

router.get('/', getMenus);
router.get('/caseta/:casetaId', getMenusCaseta);
router.post('/', protect, crearMenu);
router.put('/:id', protect, actualizarMenu);
router.delete('/:id', protect, eliminarMenu);

module.exports = router;