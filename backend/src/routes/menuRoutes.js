const express = require('express');
const router = express.Router();
const {
  getMenus, getMenusByCaseta, createMenu, createMenusBulk, updateMenu, deleteMenu,
  searchMenus, getMenusSortedByPrice, getMenusByPriceRange, getMostExpensiveMenu,
  getCheapestMenu, getMenusWithoutDescription, countMenusByCaseta, getMenusFull,
  getMenuCaseta, getSimilarMenus, getMenuCasetaConcerts
} = require('../controllers/menuController');
const { protect, authorize } = require('../middlewares/auth');
const { menuValidator, menuUpdateValidator } = require('../middlewares/validators');

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
 * /api/menus/sorted/price:
 *   get:
 *     summary: Get menus sorted by price ascending
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: List of menus sorted by price
 */
router.get('/sorted/price', getMenusSortedByPrice);

/**
 * @swagger
 * /api/menus/filter/price:
 *   get:
 *     summary: Get menus by price range
 *     tags: [Menus]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of menus within the price range
 */
router.get('/filter/price', getMenusByPriceRange);

/**
 * @swagger
 * /api/menus/filter/mostexpensive:
 *   get:
 *     summary: Get most expensive menu item
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: Most expensive menu item
 *       404:
 *         description: No menus found
 */
router.get('/filter/mostexpensive', getMostExpensiveMenu);

/**
 * @swagger
 * /api/menus/filter/cheapest:
 *   get:
 *     summary: Get cheapest menu item
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: Cheapest menu item
 *       404:
 *         description: No menus found
 */
router.get('/filter/cheapest', getCheapestMenu);

/**
 * @swagger
 * /api/menus/filter/nodescription:
 *   get:
 *     summary: Get menus without description
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: List of menus without description
 */
router.get('/filter/nodescription', getMenusWithoutDescription);

/**
 * @swagger
 * /api/menus/filter/full:
 *   get:
 *     summary: Get menus with full caseta and fair info
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: List of menus with caseta and fair info
 */
router.get('/filter/full', getMenusFull);

/**
 * @swagger
 * /api/menus/count/bycaseta:
 *   get:
 *     summary: Count menus per caseta
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: Count of menus grouped by caseta
 */
router.get('/count/bycaseta', countMenusByCaseta);

/**
 * @swagger
 * /api/menus/search/{name}:
 *   get:
 *     summary: Search menus by name
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menus matching the name
 */
router.get('/search/:name', searchMenus);

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
router.post('/', protect, authorize('admin'), menuValidator, createMenu);

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
router.post('/bulk', protect, authorize('admin'), createMenusBulk);

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
router.put('/:id', protect, authorize('admin'), menuUpdateValidator, updateMenu);

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
/**
 * @swagger
 * /api/menus/{id}/caseta:
 *   get:
 *     summary: Get caseta of a menu
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caseta of the menu
 *       404:
 *         description: Menu not found
 */
router.get('/:id/caseta', getMenuCaseta);

/**
 * @swagger
 * /api/menus/{id}/similar:
 *   get:
 *     summary: Get similar menus by price
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of similar menus
 *       404:
 *         description: Menu not found
 */
router.get('/:id/similar', getSimilarMenus);

/**
 * @swagger
 * /api/menus/{id}/caseta/concerts:
 *   get:
 *     summary: Get concerts of the caseta of a menu
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concerts of the caseta
 *       404:
 *         description: Menu not found
 */
router.get('/:id/caseta/concerts', getMenuCasetaConcerts);

router.delete('/:id', protect, authorize('admin'), deleteMenu);

module.exports = router;