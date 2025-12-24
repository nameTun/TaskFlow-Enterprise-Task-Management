import mongoose from "mongoose";
const DOCUMENT_NAME = "KeyToken";
const COLLECTION_NAME = "KeyTokens";
// Định nghĩa schema cho model Refresh Token
const refreshTokenSchema = new mongoose.Schema(
  {
    // Trường token: Chuỗi token, bắt buộc, duy nhất.
    token: {
      type: String,
      required: true,
      unique: true,
    },
    // Trường userId: ID của người dùng sở hữu token, tham chiếu đến model User, bắt buộc.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index để tìm nhanh token của user (khi logout all devices)
    },
    // --- THÔNG TIN THIẾT BỊ ---
    deviceId: String,
    deviceInfo: String,
    ipAddress: String,

    // Trường issuedAt: Thời gian token được cấp, mặc định là thời gian hiện tại.
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    // Thời điểm hết hạn
    expiresAt: {
      type: Date,
      required: true,
      // TTL Index: expireAfterSeconds = 0 nghĩa là MongoDB sẽ xóa document
      // ngay khi thời gian hệ thống > giá trị của trường expiresAt.
      // (Khác với việc set 30 ngày ở đây nếu field này là createdAt)
      expires: 0,
    },
    // Trường lastUsedAt: Thời gian token được sử dụng gần nhất, mặc định là thời gian hiện tại.
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    // Trường isRevoked: Cờ đánh dấu token đã bị thu hồi chưa, mặc định là false.
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Tự động thêm trường `createdAt` và `updatedAt` (hoặc có thể bỏ nếu `issuedAt` và `updatedAt` đã đủ)
    collection: COLLECTION_NAME, // Tên collection trong MongoDB
  }
);

// Tạo model RefreshToken từ schema
const keyToken = mongoose.model(DOCUMENT_NAME, refreshTokenSchema);

export default keyToken;
