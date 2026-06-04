const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { loginValidator, registerValidator } = require('../middlewares/validators');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
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
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (created as viewer)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered, returns JWT token
 *       409:
 *         description: Email already in use
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile
 *       401:
 *         description: Not authorized
 */
router.get('/profile', protect, getProfile);

module.exports = router;