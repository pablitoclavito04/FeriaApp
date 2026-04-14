const express = require('express');
const router = express.Router();
const { publish } = require('../controllers/publishController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * /api/publish:
 *   post:
 *     summary: Generate static files and publish to GitHub Pages
 *     tags: [Publish]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Published successfully
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Error publishing
 */
router.post('/', protect, publish);

module.exports = router;