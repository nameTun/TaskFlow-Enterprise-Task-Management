import express from "express";
import { chat } from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";


const router = express.Router();

// Tất cả các route AI đều yêu cầu đăng nhập
router.use(protect);

// @route   POST /api/v1/ai/chat
// @desc    Chat với AI Agent
router.post("/chat", chat);

export default router;