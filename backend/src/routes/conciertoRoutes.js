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

/**
 * @swagger
 * /api/conciertos:
 *   get:
 *     summary: Obtener todos los conciertos
 *     tags: [Conciertos]
 *     responses:
 *       200:
 *         description: Lista de conciertos
 */
router.get('/', getConciertos);

/**
 * @swagger
 * /api/conciertos/caseta/{casetaId}:
 *   get:
 *     summary: Obtener conciertos de una caseta
 *     tags: [Conciertos]
 *     parameters:
 *       - in: path
 *         name: casetaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de conciertos de la caseta
 */
router.get('/caseta/:casetaId', getConciertosCC);

/**
 * @swagger
 * /api/conciertos:
 *   post:
 *     summary: Crear un concierto
 *     tags: [Conciertos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               artista:
 *                 type: string
 *               genero:
 *                 type: string
 *               fecha:
 *                 type: string
 *               hora:
 *                 type: string
 *               caseta:
 *                 type: string
 *     responses:
 *       201:
 *         description: Concierto creado correctamente
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, crearConcierto);

/**
 * @swagger
 * /api/conciertos/{id}:
 *   put:
 *     summary: Actualizar un concierto
 *     tags: [Conciertos]
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
 *         description: Concierto actualizado correctamente
 *       404:
 *         description: Concierto no encontrado
 */
router.put('/:id', protect, actualizarConcierto);

/**
 * @swagger
 * /api/conciertos/{id}:
 *   delete:
 *     summary: Eliminar un concierto
 *     tags: [Conciertos]
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
 *         description: Concierto eliminado correctamente
 *       404:
 *         description: Concierto no encontrado
 */
router.delete('/:id', protect, eliminarConcierto);

module.exports = router;