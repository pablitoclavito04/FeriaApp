const express = require('express');
const router = express.Router();
const { login, getPerfil } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login del administrador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login correcto, devuelve token JWT
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener perfil del administrador
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del administrador
 *       401:
 *         description: No autorizado
 */
router.get('/perfil', protect, getPerfil);

module.exports = router;