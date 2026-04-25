const express = require('express');
const router = express.Router();
const { getMenus, getMenusByCaseta, createMenu, createMenusBulk, updateMenu, deleteMenu } = require('../controllers/menuController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Get all menu items
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/', getMenus);

/**
 * @swagger
 * /api/menus/caseta/{casetaId}:
 *   get:
 *     summary: Get menu items by caseta
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: casetaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menu items for the caseta
 */
router.get('/caseta/:casetaId', getMenusByCaseta);

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create a menu item
 *     tags: [Menus]
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
 *               price:
 *                 type: number
 *               caseta:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, createMenu);

/**
 * @swagger
 * /api/menus/bulk:
 *   post:
 *     summary: Create multiple menu items for the same caseta
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caseta:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Menu items created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post('/bulk', protect, createMenusBulk);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menus]
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
 *         description: Menu item updated successfully
 *       404:
 *         description: Menu item not found
 */
router.put('/:id', protect, updateMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menus]
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
 *         description: Menu item deleted successfully
 *       404:
 *         description: Menu item not found
 */
router.delete('/:id', protect, deleteMenu);

module.exports = router;