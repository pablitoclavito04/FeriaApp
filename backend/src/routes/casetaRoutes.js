const express = require('express');
const router = express.Router();
const {
  getCasetas, getCaseta, createCaseta, updateCaseta, deleteCaseta,
  searchCasetas, getCasetasSortedDesc, getCasetasWithImage, getCasetasWithoutImage,
  getHighestCaseta, getCasetasWithLocation, getCasetaFull, countCasetasByFair
} = require('../controllers/casetaController');
const { protect } = require('../middlewares/auth');
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
router.post('/', protect, upload.single('image'), createCaseta);

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
router.put('/:id', protect, upload.single('image'), updateCaseta);

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