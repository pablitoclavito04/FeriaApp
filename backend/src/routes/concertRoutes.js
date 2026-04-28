const express = require('express');
const router = express.Router();
const {
  getConcerts, getConcertsByCaseta, createConcert, updateConcert, deleteConcert,
  searchConcerts, getConcertsSortedDesc, getConcertsByDateRange, getConcertsByGenre,
  getUpcomingConcerts, countConcertsByCaseta, getConcertsWithoutGenre, getConcertsFull,
  getConcertCaseta, getConcertsSameDay, getConcertsSameGenre, getConcertCasetaMenus
} = require('../controllers/concertController');
const { protect, authorize } = require('../middlewares/auth');
const { concertValidator, concertUpdateValidator } = require('../middlewares/validators');

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
router.post('/', protect, authorize('admin'), concertValidator, createConcert);

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
router.put('/:id', protect, authorize('admin'), concertUpdateValidator, updateConcert);

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
/**
 * @swagger
 * /api/concerts/{id}/caseta:
 *   get:
 *     summary: Get caseta of a concert
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caseta of the concert
 *       404:
 *         description: Concert not found
 */
router.get('/:id/caseta', getConcertCaseta);

/**
 * @swagger
 * /api/concerts/{id}/sameday:
 *   get:
 *     summary: Get concerts on the same day
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts on the same day
 *       404:
 *         description: Concert not found
 */
router.get('/:id/sameday', getConcertsSameDay);

/**
 * @swagger
 * /api/concerts/{id}/samegenre:
 *   get:
 *     summary: Get concerts of the same genre
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts of the same genre
 *       404:
 *         description: Concert not found
 */
router.get('/:id/samegenre', getConcertsSameGenre);

/**
 * @swagger
 * /api/concerts/{id}/caseta/menus:
 *   get:
 *     summary: Get menus of the caseta of a concert
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menus of the caseta
 *       404:
 *         description: Concert not found
 */
router.get('/:id/caseta/menus', getConcertCasetaMenus);

router.delete('/:id', protect, authorize('admin'), deleteConcert);

module.exports = router;