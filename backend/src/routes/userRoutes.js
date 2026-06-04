const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { roleUpdateValidator } = require('../middlewares/validators');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only, excludes the requester)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Not authorized
 */
router.get('/', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Change a user's role (admin only)
 *     tags: [Users]
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
 *         description: User role updated
 *       403:
 *         description: Not authorized / cannot change own role
 *       404:
 *         description: User not found
 */
router.put('/:id/role', protect, authorize('admin'), roleUpdateValidator, updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 *       403:
 *         description: Not authorized / cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
