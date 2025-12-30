
import { OK, CREATED } from "../core/success.response.js";
import * as teamService from "../services/team.service.js";
import TeamDto from "../dtos/team.dto.js"; 
import asyncHandler from "../helpers/asyncHandler.js";

const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.user._id, req.body);
  new CREATED({
    message: "Tạo nhóm thành công",
    metadata: new TeamDto(team),
  }).send(res);
});

const getMyTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getMyTeam(req.user._id);
  new OK({
    message: "Lấy thông tin nhóm thành công",
    metadata: team ? new TeamDto(team) : null,
  }).send(res);
});

const inviteMember = asyncHandler(async (req, res) => {
  // Return message đơn giản vì chưa add vào team ngay
  const result = await teamService.addMember(req.user._id, req.body.email);
  new OK({
    message: result.message,
  }).send(res);
});

const respondInvite = asyncHandler(async (req, res) => {
  const { notificationId, accept } = req.body;
  const result = await teamService.respondToInvite(
    req.user._id,
    notificationId,
    accept
  );
  new OK({
    message: result.message,
  }).send(res);
});

const removeMember = asyncHandler(async (req, res) => {
  await teamService.removeMember(req.user._id, req.params.memberId);
  new OK({
    message: "Đã xóa thành viên khỏi nhóm",
  }).send(res);
});

const leaveTeam = asyncHandler(async (req, res) => {
  const result = await teamService.leaveTeam(req.user._id);
  new OK({
    message: result.message,
  }).send(res);
});
export{
  createTeam,
  getMyTeam,
  inviteMember,
  removeMember,
  respondInvite,
  leaveTeam

}