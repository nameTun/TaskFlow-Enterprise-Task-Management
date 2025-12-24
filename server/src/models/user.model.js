import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";
/**
 * USER MODEL (Mô hình Người dùng)
 * ------------------------------------------------------------------
 * Quản lý thông tin định danh, xác thực và phân quyền.
 * Áp dụng các kỹ thuật bảo mật: 
 * 1. Hash password (bcrypt).
 * 2. Ẩn trường nhạy cảm (select: false).
 * 3. Chống Brute-force (khóa tài khoản tạm thời).
 * 4. Soft Delete (xóa mềm).
 */

// Định nghĩa schema cho model Người dùng (User)
const userSchema = new mongoose.Schema(
  {
    // Tên hiển thị (Full Name)
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên người dùng"], // Validation message
      trim: true, // Tự động cắt khoảng trắng đầu/cuối: "  A  " -> "A"
      maxLength: 150,
    },
    // Trường email: bắt buộc, duy nhất, cắt khoảng trắng, chuyển về chữ thường.
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true, // Mongoose tự động tạo Unique Index tại đây
      trim: true,
      lowercase: true, // Chuyển về chữ thường để tránh lỗi "User@test.com" != "user@test.com"
    },

    // Trường passwordHash: lưu mật khẩu đã được hash bằng bcrypt. Có thể để trống nếu dùng Google OAuth.
    // Mật khẩu đã mã hóa (Hashed Password)
    // Quan trọng: select: false để trường này KHÔNG bao giờ được trả về
    // trong các câu lệnh find() thông thường, tránh lộ hash khi query API list users.
    passwordHash: {
      type: String,
      select: false,
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

    // --- OAUTH INFO ---
    // Trường oauthProvider: Nhà cung cấp OAuth, ví dụ 'google'.
    oauthProvider: {
      type: String,
      enum: ["google"], // Mở rộng thêm facebook/github sau này nếu cần
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

    // --- BẢO MẬT (SECURITY) ---
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

// --- METHODS (Phương thức trên từng document) ---
// Phương thức để so sánh mật khẩu (dùng khi đăng nhập)
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Nếu user này đăng nhập bằng Google, sẽ không có passwordHash
  if (!this.passwordHash) return false;
  // So sánh mật khẩu ứng viên với mật khẩu đã hash trong DB
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// --- MIDDLEWARE (Hooks) ---
// Trước khi lưu (save/create), tự động mã hóa mật khẩu
userSchema.pre('save', async function(next) {
  // Chỉ hash nếu password có thay đổi (tạo mới hoặc đổi pass)
  if (!this.isModified('passwordHash')) return next();
  // Salt rounds = 12 (Độ khó cao, an toàn hơn mức chuẩn 10)
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// --- INDEXES (Tối ưu hiệu suất truy vấn) ---
// userSchema.index({ role: 1 }); // Để lọc user theo quyền (VD: Lấy tất cả Admin)
// userSchema.index({ deletedAt: 1 }); // Để lọc user chưa bị xóa (deletedAt: null)

// Đánh chỉ mục để tối ưu hóa truy vấn
// 3. Chỉ mục cho vai trò (truy vấn dựa trên vai trò)
userSchema.index({ role: 1 });
// // 4. Chỉ mục cho teamId (truy vấn dựa trên đội)
// userSchema.index({ teamId: 1 });
// // 5. Chỉ mục tổng hợp cho người dùng hoạt động và vai trò
// userSchema.index({ isActive: 1, role: 1 });
// // 6. Chỉ mục TTL (Time To Live) cho trường accountLockedUntil, tự động xóa sau 1 giờ nếu có giá trị
// userSchema.index({ accountLockedUntil: 1 }, { expireAfterSeconds: 3600, sparse: true });

// Tạo model User từ schema
const User = mongoose.model(DOCUMENT_NAME, userSchema);

export default User;