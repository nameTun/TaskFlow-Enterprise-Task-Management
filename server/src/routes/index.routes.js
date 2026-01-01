import express from "express";
import authRoutes from "./auth.routes.js";
// import todoRoutes from "./todo.routes.js";
import taskRoutes from "./task.routes.js";
import teamRoutes from "./team.routes.js";
import userRoutes from "./user.routes.js";
import aiRoutes from "./ai.routes.js";
import notificationRoutes from "./notification.routes.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Định tuyến các đường dẫn cơ sở cho mỗi router con
// Auth Routes: Đăng ký, Đăng nhập, Refresh Token...
router.use('/auth', authRoutes);

// Task Routes: CRUD Tasks
router.use('/tasks', protect, taskRoutes);

// Team Routes 
router.use('/teams', teamRoutes);

// User Routes
router.use("/users", userRoutes);

router.use("/notifications", notificationRoutes);

// AI Routes
router.use("/ai", aiRoutes); 

export default router;
