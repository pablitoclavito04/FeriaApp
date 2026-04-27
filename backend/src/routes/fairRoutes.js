const express = require('express');
const router = express.Router();
const {
  getFairs, getFair, createFair, updateFair, deleteFair,
  getActiveFairs, searchFairs, getFairsByDateRange, getLatestFair,
  getFairWithCasetas, countFairsByStatus, getFairsSortedByEndDate, getFairFull
} = require('../controllers/fairController');
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
 * /api/fairs/active:
 *   get:
 *     summary: Get active fairs
 *     tags: [Fairs]
 *     responses:
 *       200:
 *         description: List of active fairs
 */
router.get('/active', getActiveFairs);

/**
 * @swagger
 * /api/fairs/latest:
 *   get:
 *     summary: Get most recent fair
 *     tags: [Fairs]
 *     responses:
 *       200:
 *         description: Most recent fair
 *       404:
 *         description: No fairs found
 */
router.get('/latest', getLatestFair);

/**
 * @swagger
 * /api/fairs/range:
 *   get:
 *     summary: Get fairs by date range
 *     tags: [Fairs]
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
 *         description: List of fairs within the date range
 */
router.get('/range', getFairsByDateRange);

/**
 * @swagger
 * /api/fairs/count/status:
 *   get:
 *     summary: Count active vs inactive fairs
 *     tags: [Fairs]
 *     responses:
 *       200:
 *         description: Counts of active, inactive and total fairs
 */
router.get('/count/status', countFairsByStatus);

/**
 * @swagger
 * /api/fairs/sorted/enddate:
 *   get:
 *     summary: Get fairs sorted by end date descending
 *     tags: [Fairs]
 *     responses:
 *       200:
 *         description: List of fairs sorted by end date
 */
router.get('/sorted/enddate', getFairsSortedByEndDate);

/**
 * @swagger
 * /api/fairs/search/{name}:
 *   get:
 *     summary: Search fairs by name
 *     tags: [Fairs]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of fairs matching the name
 */
router.get('/search/:name', searchFairs);

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
 * /api/fairs/{id}/casetas:
 *   get:
 *     summary: Get fair with its casetas
 *     tags: [Fairs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fair with its casetas
 *       404:
 *         description: Fair not found
 */
router.get('/:id/casetas', getFairWithCasetas);

/**
 * @swagger
 * /api/fairs/{id}/full:
 *   get:
 *     summary: Get fair with full details (casetas, menus, concerts)
 *     tags: [Fairs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fair with all related data
 *       404:
 *         description: Fair not found
 */
router.get('/:id/full', getFairFull);

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