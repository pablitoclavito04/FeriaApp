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

/**
 * @swagger
 * /api/casetas:
 *   get:
 *     summary: Obtener todas las casetas
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: Lista de casetas
 */
router.get('/', getCasetas);

/**
 * @swagger
 * /api/casetas/{id}:
 *   get:
 *     summary: Obtener una caseta por ID
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caseta encontrada
 *       404:
 *         description: Caseta no encontrada
 */
router.get('/:id', getCaseta);

/**
 * @swagger
 * /api/casetas:
 *   post:
 *     summary: Crear una caseta
 *     tags: [Casetas]
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
 *               numero:
 *                 type: number
 *               descripcion:
 *                 type: string
 *               feria:
 *                 type: string
 *     responses:
 *       201:
 *         description: Caseta creada correctamente
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, crearCaseta);

/**
 * @swagger
 * /api/casetas/{id}:
 *   put:
 *     summary: Actualizar una caseta
 *     tags: [Casetas]
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
 *         description: Caseta actualizada correctamente
 *       404:
 *         description: Caseta no encontrada
 */
router.put('/:id', protect, actualizarCaseta);

/**
 * @swagger
 * /api/casetas/{id}:
 *   delete:
 *     summary: Eliminar una caseta
 *     tags: [Casetas]
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
 *         description: Caseta eliminada correctamente
 *       404:
 *         description: Caseta no encontrada
 */
router.delete('/:id', protect, eliminarCaseta);

module.exports = router;