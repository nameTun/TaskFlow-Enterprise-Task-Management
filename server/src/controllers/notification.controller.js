import Notification from "../models/notification.model.js";
import { OK } from "../core/success.response.js";
import asyncHandler from "../helpers/asyncHandler.js";

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .populate("senderId", "name avatar")
    .populate("payload.teamId", "name")
    .sort({ createdAt: -1 })
    .limit(20);

  new OK({
    message: "Lấy thông báo thành công",
    metadata: notifications,
  }).send(res);
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  new OK({ message: "Đã xem" }).send(res);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  new OK({ message: "Đã đánh dấu tất cả là đã đọc" }).send(res);
});

export{
  getMyNotifications,
  markAsRead,
  markAllAsRead

}