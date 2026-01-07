
import express from "express";
import {
  createTeam,
  getMyTeam,
  inviteMember,
  removeMember,
  respondInvite,
  leaveTeam
} from "../controllers/team.controller.js";
import {
  validateCreateTeam,
  validateInviteMember,
} from "../validators/team.validator.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Quản lý đội nhóm và thành viên
 */

router.use(protect);

/**
 * @swagger
 * /teams/me:
 *   get:
 *     summary: Lấy thông tin Team hiện tại của User
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Thông tin team và danh sách thành viên
 */
router.get("/me", getMyTeam);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Tạo Team mới
 *     description: User tạo team sẽ tự động trở thành Team Lead
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo team thành công
 */
router.post("/", validateCreateTeam, createTeam);

/**
 * @swagger
 * /teams/invite:
 *   post:
 *     summary: Mời thành viên vào Team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Lời mời đã được gửi
 */
router.post(
  "/invite",
  restrictTo("admin", "team_lead"),
  validateInviteMember,
  inviteMember
);
/**
 * @swagger
 * /teams/respond-invite:
 *   post:
 *     summary: Chấp nhận hoặc từ chối lời mời vào Team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationId
 *               - accept
 *             properties:
 *               notificationId:
 *                 type: string
 *               accept:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Xử lý thành công
 */
router.post('/respond-invite', respondInvite);

/**
 * @swagger
 * /teams/leave:
 *   post:
 *     summary: Rời khỏi Team hiện tại
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Rời team thành công
 */
router.post('/leave', leaveTeam);

/**
 * @swagger
 * /teams/members/{memberId}:
 *   delete:
 *     summary: Xóa thành viên khỏi Team (Chỉ Lead/Admin)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã xóa thành viên
 */
router.delete(
  "/members/:memberId",
  restrictTo("admin", "team_lead"),
  removeMember
);

export default router;
