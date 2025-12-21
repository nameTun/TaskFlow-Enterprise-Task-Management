import mongoose from 'mongoose';
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
    },
    // Trường deviceId: ID của thiết bị client đã tạo token.
    deviceId: {
      type: String,
    },
    // Trường deviceInfo: Thông tin chi tiết về thiết bị (ví dụ: trình duyệt/OS).
    deviceInfo: {
      type: String,
    },
    // Trường ipAddress: Địa chỉ IP mà token được tạo ra.
    ipAddress: {
      type: String,
    },
    // Trường issuedAt: Thời gian token được cấp, mặc định là thời gian hiện tại.
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    // Trường expiresAt: Thời gian token hết hạn, bắt buộc.
    expiresAt: {
      type: Date,
      required: true,
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
    // Trường revokedAt: Thời gian token bị thu hồi.
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Tự động thêm trường `createdAt` và `updatedAt` (hoặc có thể bỏ nếu `issuedAt` và `updatedAt` đã đủ)
    collection: COLLECTION_NAME, // Tên collection trong MongoDB
  }
);

// Đánh chỉ mục để tối ưu hóa truy vấn
// 1. Chỉ mục cho token, đảm bảo token là duy nhất để truy vấn nhanh
refreshTokenSchema.index({ token: 1 }, { unique: true });
// 2. Chỉ mục cho userId để truy vấn các token của một người dùng cụ thể
refreshTokenSchema.index({ userId: 1 });
// 3. Chỉ mục TTL (Time To Live) cho trường expiresAt.
// Document sẽ tự động bị xóa sau 30 ngày kể từ expiresAt.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 });

// Tạo model RefreshToken từ schema
const RefreshToken = mongoose.model(DOCUMENT_NAME, refreshTokenSchema);

export default RefreshToken;