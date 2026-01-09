import express from "express";
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  restoreTaskController,
  getTrashController,
  addSubTaskController,
  updateSubTaskController,
  deleteSubTaskController,
} from "../controllers/task.controller.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../validators/task.validator.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
const router = express.Router();

/**
 * --- TẦNG BẢO VỆ: RBAC (ROLE-BASED) & INPUT VALIDATION ---
 * Sử dụng restrictTo để chặn sớm các Role không hợp lệ trước khi vào Controller.
 */

/**
 * @swagger
 * /tasks/trash:
 *   get:
 *     summary: Xem thùng rác (Các task đã bị xóa)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Danh sách task đã xóa
 */
router.get('/trash', getTrashController);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Lấy danh sách công việc
 *     description: Hỗ trợ lọc theo trạng thái, độ ưu tiên, tìm kiếm và phân trang.
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang số (Mặc định 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng item/trang (Mặc định 10)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, review, done]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Lọc theo mức độ ưu tiên
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề hoặc mô tả
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         tasks:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Task'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 */
router.get("/", getAllTasksController);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Tạo công việc mới
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     metadata:
 *                       $ref: '#/components/schemas/Task'
 */
router.post(
  "/",
  restrictTo("admin", "team_lead", "user"),
  validateCreateTask,
  createTaskController
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Lấy chi tiết công việc
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (e.g. TASK-1001) hoặc ObjectId
 *     responses:
 *       200:
 *         description: Thông tin chi tiết
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     metadata:
 *                       $ref: '#/components/schemas/Task'
 */
router.get("/:id", getTaskByIdController);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Cập nhật công việc
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
  "/:id",
  restrictTo("admin", "team_lead", "user"),
  validateUpdateTask,
  updateTaskController
);

/**
 * @swagger
 * /tasks/{id}/restore:
 *   patch:
 *     summary: Khôi phục công việc từ thùng rác
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Khôi phục thành công
 */
router.patch(
  "/:id/restore",
  restrictTo("admin", "team_lead", "user"),
  restoreTaskController
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Xóa công việc (Soft Delete)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã chuyển vào thùng rác
 */
router.delete(
  "/:id",
  restrictTo("admin", "team_lead", "user"),
  deleteTaskController
);

// --- SUBTASKS ---
/**
 * @swagger
 * /tasks/{taskId}/subtasks:
 *   post:
 *     summary: Thêm công việc nhỏ (Checklist)
 *     tags: [Tasks]
 */
router.post(
  "/:taskId/subtasks",
  restrictTo("admin", "team_lead", "user"),
  addSubTaskController
);

/**
 * @swagger
 * /tasks/{taskId}/subtasks/{subTaskId}:
 *   patch:
 *     summary: Cập nhật công việc nhỏ (Toggle check / Rename)
 *     tags: [Tasks]
 */
router.patch(
  "/:taskId/subtasks/:subTaskId",
  restrictTo("admin", "team_lead", "user"),
  updateSubTaskController
);

/**
 * @swagger
 * /tasks/{taskId}/subtasks/{subTaskId}:
 *   delete:
 *     summary: Xóa công việc nhỏ
 *     tags: [Tasks]
 */
router.delete(
  "/:taskId/subtasks/:subTaskId",
  restrictTo("admin", "team_lead", "user"),
  deleteSubTaskController
);

export default router;
