
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

router.use(protect);

// GET /api/v1/teams/me - Xem team của tôi
router.get("/me", getMyTeam);

// POST /api/v1/teams - Tạo team (Bất kỳ user nào chưa có team đều được tạo)
router.post("/", validateCreateTeam, createTeam);

// POST /api/v1/teams/invite - Mời thành viên (Chỉ Lead/Admin)
router.post(
  "/invite",
  restrictTo("admin", "team_lead"),
  validateInviteMember,
  inviteMember
);
// Route xử lý chấp nhận/từ chối lời mời
router.post('/respond-invite', respondInvite);

// Route rời nhóm (Cho member)
router.post('/leave', leaveTeam);

// DELETE /api/v1/teams/members/:memberId - Xóa thành viên
router.delete(
  "/members/:memberId",
  restrictTo("admin", "team_lead"),
  removeMember
);

export default router;
