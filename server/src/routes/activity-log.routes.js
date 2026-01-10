import express from "express";
import ActivityLogController from "../controllers/activity-log.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/:taskId", ActivityLogController.getLogs);

export default router;
