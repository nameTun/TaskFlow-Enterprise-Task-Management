import mongoose from 'mongoose';

const DOCUMENT_NAME = "Task";
const COLLECTION_NAME = "Tasks";

// Định nghĩa schema cho model Todo (công việc)
const taskSchema = new mongoose.Schema(
  {
    // Trường title: Tiêu đề công việc, bắt buộc, cắt khoảng trắng.
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Trường description: Mô tả công việc, cắt khoảng trắng.
    description: {
      type: String,
      trim: true,
    },
    // Trường status: Trạng thái công việc, có các giá trị enum cố định, mặc định là 'todo'.
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    // Trường priority: Mức độ ưu tiên, có các giá trị enum cố định, mặc định là 'medium'.
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    // Trường tags: Mảng các tag của công việc, mỗi tag là một chuỗi.
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // --- THỜI GIAN ---
    startDate: { type: Date },
    // Trường dueDate: Ngày hết hạn của công việc.
    dueDate: {
      type: Date,
    },
    // Trường completedAt: Thời gian hoàn thành công việc.
    completedAt: {
      type: Date,
    },

    // --- NHÂN SỰ LIÊN QUAN ---
    // Trường createdBy: ID của người tạo công việc, tham chiếu đến model User, bắt buộc.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Trường assignedTo: ID của người được giao việc, tham chiếu đến model User.
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Trường teamId: ID của đội mà công việc thuộc về, tham chiếu đến model Team.
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    // Trường category: Danh mục của công việc, cắt khoảng trắng.
    category: {
      type: String,
      trim: true,
    },

    // Trường visibility: Quyền riêng tư của công việc, mặc định là 'private'.
    visibility: {
      type: String,
      enum: ["private", "team", "public"],
      default: "private",
    },
    // Trường sharedWith: Mảng các ID người dùng được chia sẻ công việc này.
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Trường updatedBy: ID của người cập nhật công việc gần nhất.
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Trường isArchived: Đánh dấu công việc đã được lưu trữ (soft delete), mặc định là false.
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Tự động thêm trường `createdAt` và `updatedAt`
    collection: COLLECTION_NAME, // Tên collection trong MongoDB  
  }
);

// Đánh chỉ mục (theo thiết kế trong Data Design.ini) để tối ưu hóa truy vấn
// 1. Chỉ mục tổng hợp cho các todo của người tạo, trạng thái và ngày tạo
taskSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
// 2. Chỉ mục tổng hợp cho các todo được giao và trạng thái
taskSchema.index({ assignedTo: 1, status: 1 });
// 3. Chỉ mục tổng hợp cho các todo của đội và trạng thái
taskSchema.index({ teamId: 1, status: 1 });
// 4. Chỉ mục tổng hợp cho ngày hết hạn và trạng thái
taskSchema.index({ dueDate: 1, status: 1 });
// 5. Chỉ mục tìm kiếm toàn văn cho tiêu đề và mô tả
taskSchema.index({ title: 'text', description: 'text' });
// 6. Chỉ mục cho trường tags
taskSchema.index({ tags: 1 });
// 7. Chỉ mục cho trường category
taskSchema.index({ category: 1 });

// Tạo model Todo từ schema
const Task = mongoose.model(DOCUMENT_NAME, taskSchema);

export default Task;