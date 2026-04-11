const express = require('express');
const router = express.Router();
const { getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta } = require('../controllers/casetaController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * /api/casetas:
 *   get:
 *     summary: Get all casetas
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: List of casetas
 */
router.get('/', getCasetas);

/**
 * @swagger
 * /api/casetas/{id}:
 *   get:
 *     summary: Get a caseta by ID
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caseta found
 *       404:
 *         description: Caseta not found
 */
router.get('/:id', getCaseta);

/**
 * @swagger
 * /api/casetas:
 *   post:
 *     summary: Create a caseta
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
 *               name:
 *                 type: string
 *               number:
 *                 type: number
 *               description:
 *                 type: string
 *               fair:
 *                 type: string
 *     responses:
 *       201:
 *         description: Caseta created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, createCaseta);

/**
 * @swagger
 * /api/casetas/{id}:
 *   put:
 *     summary: Update a caseta
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
 *         description: Caseta updated successfully
 *       404:
 *         description: Caseta not found
 */
router.put('/:id', protect, updateCaseta);

/**
 * @swagger
 * /api/casetas/{id}:
 *   delete:
 *     summary: Delete a caseta
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
 *         description: Caseta deleted successfully
 *       404:
 *         description: Caseta not found
 */
router.delete('/:id', protect, deleteCaseta);

module.exports = router;