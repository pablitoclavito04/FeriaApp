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

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Obtener todos los menús
 *     tags: [Menús]
 *     responses:
 *       200:
 *         description: Lista de menús
 */
router.get('/', getMenus);

/**
 * @swagger
 * /api/menus/caseta/{casetaId}:
 *   get:
 *     summary: Obtener menús de una caseta
 *     tags: [Menús]
 *     parameters:
 *       - in: path
 *         name: casetaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de menús de la caseta
 */
router.get('/caseta/:casetaId', getMenusCaseta);

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Crear un plato del menú
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               caseta:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plato creado correctamente
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, crearMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Actualizar un plato del menú
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plato actualizado correctamente
 *       404:
 *         description: Plato no encontrado
 */
router.put('/:id', protect, actualizarMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Eliminar un plato del menú
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plato eliminado correctamente
 *       404:
 *         description: Plato no encontrado
 */
router.delete('/:id', protect, eliminarMenu);

module.exports = router;