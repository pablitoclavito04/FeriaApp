const express = require('express');
const router = express.Router();
const { getFairs, getFair, createFair, updateFair, deleteFair } = require('../controllers/fairController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * /api/fairs:
 *   get:
 *     summary: Get all fairs
 *     tags: [Fairs]
 *     responses:
 *       200:
 *         description: List of fairs
 */
router.get('/', getFairs);

/**
 * @swagger
 * /api/fairs/{id}:
 *   get:
 *     summary: Get a fair by ID
 *     tags: [Fairs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fair found
 *       404:
 *         description: Fair not found
 */
router.get('/:id', getFair);

/**
 * @swagger
 * /api/fairs:
 *   post:
 *     summary: Create a fair
 *     tags: [Fairs]
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
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fair created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, createFair);

/**
 * @swagger
 * /api/fairs/{id}:
 *   put:
 *     summary: Update a fair
 *     tags: [Fairs]
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
 *         description: Fair updated successfully
 *       404:
 *         description: Fair not found
 */
router.put('/:id', protect, updateFair);

/**
 * @swagger
 * /api/fairs/{id}:
 *   delete:
 *     summary: Delete a fair
 *     tags: [Fairs]
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
 *         description: Fair deleted successfully
 *       404:
 *         description: Fair not found
 */
router.delete('/:id', protect, deleteFair);

module.exports = router;