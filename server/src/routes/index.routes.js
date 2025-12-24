import express from "express";
import authRoutes from "./auth.routes.js";
// import todoRoutes from "./todo.routes.js";
import { protect } from "../middlewares/auth.middleware.js";
import taskRoutes from "./task.routes.js";

const router = express.Router();

// Định tuyến các đường dẫn cơ sở cho mỗi router con
// Auth Routes: Đăng ký, Đăng nhập, Refresh Token...
router.use('/auth', authRoutes);

// Task Routes: CRUD Tasks
router.use('/tasks', protect, taskRoutes);

export default router;
