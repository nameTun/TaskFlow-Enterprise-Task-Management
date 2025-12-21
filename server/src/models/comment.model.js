import mongoose from 'mongoose';

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";
// Định nghĩa schema cho model Comment (bình luận)
const commentSchema = new mongoose.Schema(
  {
    // Trường taskId: ID của công việc mà bình luận thuộc về, tham chiếu đến model Todo, bắt buộc.
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Giả sử 'Todo' là tên model cho công việc
      required: true,
      index: true, // Đánh chỉ mục để tối ưu truy vấn
    },
    // Trường userId: ID của người dùng đã tạo bình luận, tham chiếu đến model User, bắt buộc.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Đánh chỉ mục để tối ưu truy vấn
    },
    // Trường content: Nội dung của bình luận, bắt buộc.
    content: {
      type: String,
      required: true,
    },
    // Trường mentions: Mảng các ID người dùng được nhắc đến trong bình luận, tham chiếu đến model User.
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Trường parentCommentId: ID của bình luận cha (nếu là bình luận con), tham chiếu đến model Comment.
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    // Trường isDeleted: Cờ đánh dấu bình luận đã bị xóa mềm hay chưa, mặc định là false.
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Trường deletedAt: Thời gian bình luận bị xóa mềm.
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Tự động thêm trường `createdAt` và `updatedAt`
    collection: COLLECTION_NAME, // Tên collection trong MongoDB
  }
);

// Đánh chỉ mục (theo thiết kế trong Data Design.ini) để tối ưu hóa truy vấn
// 1. Chỉ mục tổng hợp để lấy bình luận theo taskId, sắp xếp theo thời gian tạo mới nhất
commentSchema.index({ taskId: 1, createdAt: -1 });
// 2. Chỉ mục tổng hợp để lấy bình luận theo userId, sắp xếp theo thời gian tạo mới nhất
commentSchema.index({ userId: 1, createdAt: -1 });

// Tạo model Comment từ schema
const Comment = mongoose.model(DOCUMENT_NAME, commentSchema);

export default Comment;
