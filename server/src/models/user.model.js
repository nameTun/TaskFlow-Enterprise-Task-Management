import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

// Định nghĩa schema cho model Người dùng (User)
const userSchema = new mongoose.Schema(
  {
    // Trường name: Tên người dùng, bắt buộc.
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 150,
    },
    // Trường email: bắt buộc, duy nhất, cắt khoảng trắng, chuyển về chữ thường.
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Trường passwordHash: lưu mật khẩu đã được hash bằng bcrypt. Có thể để trống nếu dùng Google OAuth.
    passwordHash: {
      type: String,
      //required: function() { return this.authType === 'local' }
    },
    // authType: {
    //   type: String,
    //   enum: ["local", "google"],
    //   default: "local",
    // },
    // Trường googleId: ID duy nhất từ Google OAuth. sparse: true cho phép nhiều tài liệu có giá trị null.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Trường avatar: URL ảnh đại diện, giá trị mặc định là chuỗi rỗng.
    avatar: {
      type: String,
      default: "",
    },
    // Trường role: Vai trò của người dùng, có các giá trị enum cố định, mặc định là 'user'.
    role: {
      type: String,
      enum: ["admin", "team_lead", "user", "viewer"],
      default: "user",
    },

    // status: {
    //   type: String,
    //   enum: ["active", "inactive", "banned"],
    //   default: "active",
    // },
    // Trường teamId: Tham chiếu đến model Team, dùng để gán người dùng vào một đội.
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      index: true, // Đánh chỉ mục để tối ưu truy vấn
    },
    // Trường teamRole: Vai trò của người dùng trong đội, có các giá trị enum cố định.
    teamRole: {
      type: String,
      enum: ["lead", "member"],
    },
    // Trường oauthProvider: Nhà cung cấp OAuth, ví dụ 'google'.
    oauthProvider: {
      type: String,
      enum: ["google"],
    },
    // Trường oauthAccessToken: Access token từ nhà cung cấp OAuth, có thể tạm thời hoặc được refresh định kỳ.
    oauthAccessToken: String,
    // Trường oauthRefreshToken: Refresh token từ nhà cung cấp OAuth, có thể cần mã hóa khi lưu.
    oauthRefreshToken: String,
    // Trường oauthTokenExpiry: Thời gian hết hạn của OAuth token.
    oauthTokenExpiry: Date,
    // Lưu ý: Mảng refreshTokens không được nhúng trực tiếp vào đây
    // vì chúng được quản lý trong một collection/model RefreshToken riêng biệt.
    // Điều này giúp quản lý tốt hơn và cho phép invalidation độc lập.

    // lastPasswordChange: Ngày thay đổi mật khẩu gần nhất.
    lastPasswordChange: Date,
    // failedLoginAttempts: Số lần đăng nhập thất bại liên tiếp, mặc định là 0.
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    // accountLockedUntil: Thời gian tài khoản bị khóa nếu có quá nhiều lần đăng nhập sai.
    accountLockedUntil: Date,

    // lastLoginAt: Thời gian đăng nhập gần nhất.
    lastLoginAt: Date,
    // lastActiveAt: Thời gian hoạt động gần nhất.
    lastActiveAt: Date,

    // isActive: Trạng thái kích hoạt tài khoản, mặc định là true.
    isActive: {
      type: Boolean,
      default: true,
    },
    // isEmailVerified: Trạng thái xác minh email, mặc định là false.
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // deletedAt: Thời gian xóa mềm tài khoản.
    deletedAt: Date,
  },
  {
    timestamps: true, // Tự động thêm trường `createdAt` và `updatedAt`
    collection: COLLECTION_NAME, // Tên collection trong MongoDB
  }
);

// Phương thức để so sánh mật khẩu (dùng khi đăng nhập)
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Nếu không có passwordHash, không thể so sánh
  if (!this.passwordHash) return false;
  // So sánh mật khẩu ứng viên với mật khẩu đã hash trong DB
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Đánh chỉ mục để tối ưu hóa truy vấn
// 1. Chỉ mục cho email (đăng nhập), đảm bảo email là duy nhất
userSchema.index({ email: 1 }, { unique: true });
// 2. Chỉ mục cho googleId (tìm kiếm OAuth), đảm bảo googleId là duy nhất và cho phép null
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
// 3. Chỉ mục cho vai trò (truy vấn dựa trên vai trò)
userSchema.index({ role: 1 });
// 4. Chỉ mục cho teamId (truy vấn dựa trên đội)
userSchema.index({ teamId: 1 });
// 5. Chỉ mục tổng hợp cho người dùng hoạt động và vai trò
userSchema.index({ isActive: 1, role: 1 });
// 6. Chỉ mục TTL (Time To Live) cho trường accountLockedUntil, tự động xóa sau 1 giờ nếu có giá trị
userSchema.index({ accountLockedUntil: 1 }, { expireAfterSeconds: 3600, sparse: true });

// Tạo model User từ schema
const User = mongoose.model(DOCUMENT_NAME, userSchema);

export default User;