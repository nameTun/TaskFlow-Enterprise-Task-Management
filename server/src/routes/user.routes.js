import express from "express";
import {getAllUsers, searchUsers,createUser, updateUser, deleteUser} from "../controllers/user.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
const router = express.Router();

//------------- Admin Routes -------------
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách toàn bộ Users (Admin Only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Tìm theo tên hoặc email
 *     responses:
 *       200:
 *         description: Danh sách users
 */
router.get('/', restrictTo('admin'), getAllUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Tạo User mới (Admin Only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, team_lead, user, viewer]
 *     responses:
 *       201:
 *         description: Tạo user thành công
 */
router.post('/', restrictTo('admin'), createUser);

router.patch('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Tìm kiếm User để mời vào Team (Public search)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm (Tên, Email, Avatar)
 */
router.get('/search', searchUsers);

export default router;
