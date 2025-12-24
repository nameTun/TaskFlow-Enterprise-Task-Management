
import express from "express";
import  createTask  from "../controllers/task.controller.js";
import { validateCreateTask } from "../validators/task.validator.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Áp dụng xác thực cho tất cả các route task
router.use(protect);

// @route   POST /api/v1/tasks
// @desc    Tạo task mới
router.post("/", validateCreateTask, createTask);

export default router;
