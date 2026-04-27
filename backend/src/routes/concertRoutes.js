const express = require('express');
const router = express.Router();
const {
  getConcerts, getConcertsByCaseta, createConcert, updateConcert, deleteConcert,
  searchConcerts, getConcertsSortedDesc, getConcertsByDateRange, getConcertsByGenre,
  getUpcomingConcerts, countConcertsByCaseta, getConcertsWithoutGenre, getConcertsFull
} = require('../controllers/concertController');
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
 * /api/concerts/sorted/desc:
 *   get:
 *     summary: Get concerts sorted by date descending
 *     tags: [Concerts]
 *     responses:
 *       200:
 *         description: List of concerts sorted by date descending
 */
router.get('/sorted/desc', getConcertsSortedDesc);

/**
 * @swagger
 * /api/concerts/filter/daterange:
 *   get:
 *     summary: Get concerts by date range
 *     tags: [Concerts]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts within the date range
 */
router.get('/filter/daterange', getConcertsByDateRange);

/**
 * @swagger
 * /api/concerts/filter/upcoming:
 *   get:
 *     summary: Get upcoming concerts
 *     tags: [Concerts]
 *     responses:
 *       200:
 *         description: List of upcoming concerts
 */
router.get('/filter/upcoming', getUpcomingConcerts);

/**
 * @swagger
 * /api/concerts/filter/nogenre:
 *   get:
 *     summary: Get concerts with no genre defined
 *     tags: [Concerts]
 *     responses:
 *       200:
 *         description: List of concerts without genre
 */
router.get('/filter/nogenre', getConcertsWithoutGenre);

/**
 * @swagger
 * /api/concerts/filter/full:
 *   get:
 *     summary: Get concerts with full caseta and fair info
 *     tags: [Concerts]
 *     responses:
 *       200:
 *         description: List of concerts with caseta and fair info
 */
router.get('/filter/full', getConcertsFull);

/**
 * @swagger
 * /api/concerts/count/bycaseta:
 *   get:
 *     summary: Count concerts per caseta
 *     tags: [Concerts]
 *     responses:
 *       200:
 *         description: Count of concerts grouped by caseta
 */
router.get('/count/bycaseta', countConcertsByCaseta);

/**
 * @swagger
 * /api/concerts/filter/genre/{genre}:
 *   get:
 *     summary: Get concerts by genre
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts matching the genre
 */
router.get('/filter/genre/:genre', getConcertsByGenre);

/**
 * @swagger
 * /api/concerts/search/{artist}:
 *   get:
 *     summary: Search concerts by artist
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: artist
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts matching the artist
 */
router.get('/search/:artist', searchConcerts);

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