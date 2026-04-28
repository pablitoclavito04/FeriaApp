const express = require('express');
const router = express.Router();
const {
  getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta,
  searchCasetas, getCasetasSortedDesc, getCasetasWithImage, getCasetasWithoutImage,
  getHighestCaseta, getCasetasWithLocation, getCasetaFull, countCasetasByFair,
  getCasetaMenus, getCasetaConcerts,
  getCasetaCheapestMenu, getCasetaMostExpensiveMenu, getCasetaMenusSortedByPrice,
  getCasetaMenusCount, getCasetaUpcomingConcerts, getCasetaConcertsByGenre,
  getCasetaConcertsSortedDesc, getCasetaConcertsCount, getCasetaStats
} = require('../controllers/casetaController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

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
 * /api/casetas/sorted/desc:
 *   get:
 *     summary: Get casetas sorted by number descending
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: List of casetas sorted by number descending
 */
router.get('/sorted/desc', getCasetasSortedDesc);

/**
 * @swagger
 * /api/casetas/filter/withimage:
 *   get:
 *     summary: Get casetas that have an image
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: List of casetas with image
 */
router.get('/filter/withimage', getCasetasWithImage);

/**
 * @swagger
 * /api/casetas/filter/noimage:
 *   get:
 *     summary: Get casetas without image
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: List of casetas without image
 */
router.get('/filter/noimage', getCasetasWithoutImage);

/**
 * @swagger
 * /api/casetas/filter/highest:
 *   get:
 *     summary: Get caseta with highest number
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: Caseta with highest number
 *       404:
 *         description: No casetas found
 */
router.get('/filter/highest', getHighestCaseta);

/**
 * @swagger
 * /api/casetas/filter/withlocation:
 *   get:
 *     summary: Get casetas with location defined
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: List of casetas with location
 */
router.get('/filter/withlocation', getCasetasWithLocation);

/**
 * @swagger
 * /api/casetas/count/byfair:
 *   get:
 *     summary: Count casetas per fair
 *     tags: [Casetas]
 *     responses:
 *       200:
 *         description: Count of casetas grouped by fair
 */
router.get('/count/byfair', countCasetasByFair);

/**
 * @swagger
 * /api/casetas/search/{name}:
 *   get:
 *     summary: Search casetas by name
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of casetas matching the name
 */
router.get('/search/:name', searchCasetas);

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
 * /api/casetas/{id}/full:
 *   get:
 *     summary: Get caseta with its menus and concerts
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caseta with menus and concerts
 *       404:
 *         description: Caseta not found
 */
router.get('/:id/full', getCasetaFull);

/**
 * @swagger
 * /api/casetas/{id}/menus:
 *   get:
 *     summary: Get menus by caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menus for the caseta
 */
router.get('/:id/menus', getCasetaMenus);

/**
 * @swagger
 * /api/casetas/{id}/menus/cheapest:
 *   get:
 *     summary: Get cheapest menu of a caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cheapest menu of the caseta
 *       404:
 *         description: No menus found
 */
router.get('/:id/menus/cheapest', getCasetaCheapestMenu);

/**
 * @swagger
 * /api/casetas/{id}/menus/mostexpensive:
 *   get:
 *     summary: Get most expensive menu of a caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Most expensive menu of the caseta
 *       404:
 *         description: No menus found
 */
router.get('/:id/menus/mostexpensive', getCasetaMostExpensiveMenu);

/**
 * @swagger
 * /api/casetas/{id}/menus/sorted/price:
 *   get:
 *     summary: Get menus of a caseta sorted by price
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menus sorted by price
 */
router.get('/:id/menus/sorted/price', getCasetaMenusSortedByPrice);

/**
 * @swagger
 * /api/casetas/{id}/menus/count:
 *   get:
 *     summary: Count menus of a caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Total menus of the caseta
 */
router.get('/:id/menus/count', getCasetaMenusCount);

/**
 * @swagger
 * /api/casetas/{id}/concerts:
 *   get:
 *     summary: Get concerts by caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts for the caseta
 */
router.get('/:id/concerts', getCasetaConcerts);

/**
 * @swagger
 * /api/casetas/{id}/concerts/upcoming:
 *   get:
 *     summary: Get upcoming concerts of a caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of upcoming concerts
 */
router.get('/:id/concerts/upcoming', getCasetaUpcomingConcerts);

/**
 * @swagger
 * /api/casetas/{id}/concerts/genre/{genre}:
 *   get:
 *     summary: Get concerts of a caseta by genre
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts matching the genre
 */
router.get('/:id/concerts/genre/:genre', getCasetaConcertsByGenre);

/**
 * @swagger
 * /api/casetas/{id}/concerts/sorted/desc:
 *   get:
 *     summary: Get concerts of a caseta sorted by date descending
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts sorted by date descending
 */
router.get('/:id/concerts/sorted/desc', getCasetaConcertsSortedDesc);

/**
 * @swagger
 * /api/casetas/{id}/concerts/count:
 *   get:
 *     summary: Count concerts of a caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Total concerts of the caseta
 */
router.get('/:id/concerts/count', getCasetaConcertsCount);

/**
 * @swagger
 * /api/casetas/{id}/stats:
 *   get:
 *     summary: Get stats of a caseta
 *     tags: [Casetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stats of the caseta
 *       404:
 *         description: Caseta not found
 */
router.get('/:id/stats', getCasetaStats);

/**
 * @swagger
 * /api/casetas:
 *   post:
 *     summary: Create a caseta
 *     tags: [Casetas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Caseta created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, authorize('admin'), upload.single('image'), createCaseta);

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
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateCaseta);

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
router.delete('/:id', protect, authorize('admin'), deleteCaseta);

module.exports = router;