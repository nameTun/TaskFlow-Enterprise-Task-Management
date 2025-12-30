import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import Notification from "../models/notification.model.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../core/error.response.js";

const createTeam = async (userId, { name, description }) => {
  const user = await User.findById(userId);
  if (user.teamId) {
    throw new BadRequestError(
      "Bạn đã tham gia một nhóm khác. Vui lòng rời nhóm cũ trước."
    );
  }

  const newTeam = await Team.create({
    name,
    description,
    leadId: userId,
    createdBy: userId,
    members: [{ userId: userId, role: "member" }],
  });

  user.teamId = newTeam._id;
  // Chỉ nâng quyền lên team_lead nếu user không phải là admin
  // Admin vẫn giữ nguyên quyền admin, nhưng đóng vai trò Lead trong team này
  if (user.role !== "admin") {
    user.role = "team_lead";
  }
  await user.save();

  return newTeam;
};

const getMyTeam = async (userId) => {
  const user = await User.findById(userId);
  if (!user.teamId) return null;

  const team = await Team.findById(user.teamId)
    .populate("leadId", "name email avatar")
    .populate("members.userId", "name email avatar");

  return team;
};

/**
 * UPDATE: Mời thành viên -> Không add ngay, mà tạo Notification
 */
const addMember = async (currentUserId, emailToInvite) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser.teamId) throw new BadRequestError("Bạn chưa thuộc nhóm nào");

  const team = await Team.findById(currentUser.teamId);

  const userToInvite = await User.findOne({ email: emailToInvite });
  if (!userToInvite)
    throw new NotFoundError("Không tìm thấy người dùng với email này");

  if (userToInvite.teamId) {
    throw new BadRequestError("Người dùng này đã thuộc một nhóm khác");
  }

  const exists = team.members.some(
    (m) => m.userId.toString() === userToInvite._id.toString()
  );
  if (exists) throw new BadRequestError("Người này đã ở trong nhóm");

  // Kiểm tra xem đã mời chưa (check pending notification)
  const existingInvite = await Notification.findOne({
    recipientId: userToInvite._id,
    type: "TEAM_INVITE",
    "payload.teamId": team._id,
    status: "pending",
  });

  if (existingInvite) {
    throw new BadRequestError(
      "Đã gửi lời mời cho người này, vui lòng đợi họ chấp nhận."
    );
  }

  // Tạo Notification
  await Notification.create({
    recipientId: userToInvite._id,
    senderId: currentUserId,
    type: "TEAM_INVITE",
    title: "Lời mời tham gia nhóm",
    message: `${currentUser.name} đã mời bạn tham gia nhóm "${team.name}".`,
    payload: { teamId: team._id },
    status: "pending",
  });

  return { message: "Đã gửi lời mời thành công" };
};

/**
 * NEW: Phản hồi lời mời (Accept/Reject)
 */
const respondToInvite = async (userId, notificationId, accept) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipientId: userId,
  });
  if (!notification)
    throw new NotFoundError("Lời mời không tồn tại hoặc không dành cho bạn");

  if (
    notification.type !== "TEAM_INVITE" ||
    notification.status !== "pending"
  ) {
    throw new BadRequestError("Lời mời không hợp lệ hoặc đã được xử lý");
  }

  if (!accept) {
    notification.status = "rejected";
    await notification.save();
    return { message: "Đã từ chối lời mời" };
  }

  // Logic chấp nhận
  const team = await Team.findById(notification.payload.teamId);
  if (!team) throw new NotFoundError("Team này không còn tồn tại");

  const user = await User.findById(userId);
  if (user.teamId)
    throw new BadRequestError(
      "Bạn đã ở trong một team khác. Vui lòng rời team cũ trước khi chấp nhận."
    );

  // Add member
  team.members.push({ userId: user._id, role: "member" });
  await team.save();

  // Update user
  user.teamId = team._id;
  await user.save();

  // Update notif
  notification.status = "accepted";
  notification.isRead = true;
  await notification.save();

  return { message: "Đã tham gia nhóm thành công" };
};

const removeMember = async (currentUserId, memberIdToRemove) => {
  const currentUser = await User.findById(currentUserId);
  const team = await Team.findById(currentUser.teamId);

  if (!team) throw new NotFoundError("Team không tồn tại");

  if (
    team.leadId.toString() !== currentUserId.toString() &&
    currentUserId.toString() !== memberIdToRemove
  ) {
    throw new ForbiddenError("Chỉ trưởng nhóm mới có quyền xóa thành viên");
  }

  if (memberIdToRemove === team.leadId.toString()) {
    throw new BadRequestError(
      "Không thể xóa trưởng nhóm. Hãy xóa team nếu muốn giải tán."
    );
  }

  team.members = team.members.filter(
    (m) => m.userId.toString() !== memberIdToRemove
  );
  await team.save();

  await User.findByIdAndUpdate(memberIdToRemove, { teamId: null });

  return true;
};

const leaveTeam = async (userId) => {
  const user = await User.findById(userId);
  if (!user.teamId)
    throw new BadRequestError("Bạn không thuộc nhóm nào để rời đi.");

  const team = await Team.findById(user.teamId);
  if (!team) throw new NotFoundError("Nhóm không tồn tại.");

  // Nếu là Lead thì không được rời (phải chuyển quyền hoặc xóa team)
  if (team.leadId.toString() === userId.toString()) {
    throw new BadRequestError(
      "Bạn là Trưởng nhóm. Vui lòng chuyển quyền hoặc xóa nhóm thay vì rời đi."
    );
  }

  // Xóa khỏi danh sách members
  team.members = team.members.filter(
    (m) => m.userId.toString() !== userId.toString()
  );
  await team.save();

  // Update User
  user.teamId = null;
  await user.save();

  return { message: "Đã rời nhóm thành công." };
};
export {
  createTeam,
  getMyTeam,
  addMember,
  removeMember,
  respondToInvite,
  leaveTeam
};
