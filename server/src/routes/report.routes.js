
import express from "express";
import { getDashboardStatsController } from "../controllers/report.controller.js";
const router = express.Router();

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Lấy số liệu thống kê Dashboard (Dynamic theo Role)
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Trả về object stats khác nhau tùy role
 */
router.get("/dashboard", getDashboardStatsController);

export default router;

