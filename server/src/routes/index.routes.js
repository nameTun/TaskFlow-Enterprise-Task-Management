import express from "express";
import authRoutes from "./auth.routes.js";
// import todoRoutes from "./todo.routes.js";

const router = express.Router();

// Định tuyến các đường dẫn cơ sở cho mỗi router con
// Vì server.js đã mount router này vào '/api', nên ở đây chỉ cần khai báo path con
router.use("/auth", authRoutes);

// router.use("/todos", todoRoutes); 

export default router;
