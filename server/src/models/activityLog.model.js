import mongoose from "mongoose";
const DOCUMENT_NAME = "ActivityLog";
const COLLECTION_NAME = "ActivityLogs";

const activityLogSchema = new mongoose.Schema(
  {
    // Log của Task nào
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },

    // Ai thực hiện hành động?
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Loại hành động (Cần Enum chuẩn để Frontend dễ map icon)
    action: {
      type: String,
      enum: [
        "CREATE_TASK", // Tạo mới
        "UPDATE_STATUS", // Đổi trạng thái (VD: Todo -> Done)
        "UPDATE_PRIORITY", // Đổi ưu tiên
        "ASSIGN_USER", // Giao việc
        "COMMENT", // Bình luận
        "UPLOAD_FILE", // Tải file
        "UPDATE_DEADLINE", // Dời lịch
      ],
      required: true,
    },

    // Lưu sự thay đổi (Snapshot)
    // Ví dụ: { field: 'status', old: 'todo', new: 'in_progress' }
    content: { type: Object, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Log chỉ cần ngày tạo, không sửa
    collection: COLLECTION_NAME,
  }
);

// --- INDEXING ---
// 1. Xem lịch sử của 1 Task
activityLogSchema.index({ taskId: 1, createdAt: -1 }); // Mới nhất lên đầu

// 2. (Optional) Xem nhật ký hoạt động của 1 User (Ví dụ: Hôm nay nhân viên A làm gì?)
activityLogSchema.index({ actorId: 1, createdAt: -1 });

const activityLog = mongoose.model(DOCUMENT_NAME, activityLogSchema);
export default activityLog;
