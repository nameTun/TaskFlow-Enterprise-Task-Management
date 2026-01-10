import express from "express";
import CommentController from "../controllers/comment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/:taskId", CommentController.getComments);
router.post("/:taskId", CommentController.createComment);
router.delete("/:commentId", CommentController.deleteComment);

export default router;
