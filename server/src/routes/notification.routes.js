import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead} from "../controllers/notification.controller.js";
const router = express.Router();


/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lấy danh sách thông báo của tôi
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
router.get("/", getMyNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Đánh dấu tất cả thông báo là đã đọc
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.patch("/read-all", markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Đánh dấu 1 thông báo là đã đọc
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.patch("/:id/read", markAsRead);

export default router;