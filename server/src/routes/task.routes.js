
import express from "express";
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  restoreTaskController,
  getTrashController,
} from "../controllers/task.controller.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../validators/task.validator.js";
import { protect,restrictTo } from "../middlewares/auth.middleware.js";
const router = express.Router();

/**
 * --- TẦNG BẢO VỆ 1: AUTHENTICATION ---
 * Mọi request đều phải đăng nhập.
 */
router.use(protect);

/**
 * --- TẦNG BẢO VỆ 2: RBAC (ROLE-BASED) & INPUT VALIDATION ---
 * Sử dụng restrictTo để chặn sớm các Role không hợp lệ trước khi vào Controller.
 */

// Xem danh sách thùng rác
router.get('/trash', getTrashController);

// Xem danh sách task (Ai cũng xem được, nhưng Controller sẽ lọc data theo quyền)
router.get('/', getAllTasksController);

// Tạo task: Viewer không được tạo
router.post('/', restrictTo('admin', 'team_lead', 'user'), validateCreateTask, createTaskController);

// Xem chi tiết
router.get('/:id', getTaskByIdController);

// Cập nhật: Viewer không được sửa
router.patch('/:id', restrictTo('admin', 'team_lead', 'user'), validateUpdateTask, updateTaskController);

// Khôi phục: Viewer không được khôi phục
router.patch('/:id/restore', restrictTo('admin', 'team_lead', 'user'), restoreTaskController);

// Xóa: Viewer không được xóa. 
// Logic chi tiết (Admin xóa mọi thứ, User chỉ xóa của mình) sẽ nằm trong Controller/Policy.
router.delete('/:id', restrictTo('admin', 'team_lead', 'user'), deleteTaskController);

export default router;
