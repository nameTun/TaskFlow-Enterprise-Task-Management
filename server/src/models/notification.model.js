import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["TEAM_INVITE", "TASK_ASSIGNED", "SYSTEM", "COMMENT"],
      required: true,
    },
    title: String,
    message: String,
    payload: {
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String, // Trạng thái của lời mời (nếu là invite)
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);


