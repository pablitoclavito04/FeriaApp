const express = require('express');
const router = express.Router();
const { getConcerts, getConcertsByCaseta, createConcert, updateConcert, deleteConcert } = require('../controllers/concertController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * /api/concerts:
 *   get:
 *     summary: Get all concerts
 *     tags: [Concerts]
 *     responses:
 *       200:
 *         description: List of concerts
 */
router.get('/', getConcerts);

/**
 * @swagger
 * /api/concerts/caseta/{casetaId}:
 *   get:
 *     summary: Get concerts by caseta
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: casetaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts for the caseta
 */
router.get('/caseta/:casetaId', getConcertsByCaseta);

/**
 * @swagger
 * /api/concerts:
 *   post:
 *     summary: Create a concert
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               artist:
 *                 type: string
 *               genre:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               caseta:
 *                 type: string
 *     responses:
 *       201:
 *         description: Concert created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, createConcert);

/**
 * @swagger
 * /api/concerts/{id}:
 *   put:
 *     summary: Update a concert
 *     tags: [Concerts]
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
 *         description: Concert updated successfully
 *       404:
 *         description: Concert not found
 */
router.put('/:id', protect, updateConcert);

/**
 * @swagger
 * /api/concerts/{id}:
 *   delete:
 *     summary: Delete a concert
 *     tags: [Concerts]
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
 *         description: Concert deleted successfully
 *       404:
 *         description: Concert not found
 */
router.delete('/:id', protect, deleteConcert);

module.exports = router;