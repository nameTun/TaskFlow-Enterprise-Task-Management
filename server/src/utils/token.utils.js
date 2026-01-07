import jwt from "jsonwebtoken";
import KeyToken from "../models/keyToken.model.js";

/**
 * @desc Hàm trợ giúp để tạo Access Token và Refresh Token.
 * Access Token có thời gian sống ngắn, Refresh Token có thời gian sống dài hơn.
 * Refresh Token sẽ được lưu vào cơ sở dữ liệu.
 * @param {object} user Đối tượng người dùng từ MongoDB.
 * @returns {object} Chứa Access Token và Refresh Token.
 */

const generateTokens = async (user) => {
  // Tạo Access Token: JWT được ký với ID và vai trò của người dùng, hết hạn sau 15 phút (mặc định).
  const accessToken = jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" } // Mặc định 15 phút
  );

  // Tạo Refresh Token: JWT được ký chỉ với ID của người dùng, hết hạn sau 7 ngày (mặc định).
  const refreshToken = jwt.sign(
    { id: user._id || user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" } // Mặc định 7 ngày
  );

  // Tính toán thời gian hết hạn của Refresh Token bằng milliseconds.
  const refreshTokenExpiresInMs = parseInt(
    process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000 // 7 ngày
  );
  const refreshTokenExpires = new Date(Date.now() + refreshTokenExpiresInMs);

  // Lưu Refresh Token vào cơ sở dữ liệu để có thể quản lý (thu hồi).
  try {
    await KeyToken.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id, // BẮT BUỘC: Phải có userId trong update payload để upsert hoạt động
        token: refreshToken,
        expiresAt: refreshTokenExpires,
        lastUsedAt: Date.now(),
        isRevoked: false,
        deviceInfo: "unknown", // Có thể mở rộng lấy User-Agent sau
        ipAddress: "unknown",
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error saving Refresh Token to DB:", error);
    throw new Error("Không thể lưu phiên đăng nhập (KeyToken Error)");
  }
  return { accessToken, refreshToken };
};
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // secure: isProduction, // Localhost (http) -> false, Production (https) -> true
    // Khi dùng Proxy (Client -> Proxy -> Server), trình duyệt thấy cùng domain
    // nên Lax là chế độ an toàn và tương thích nhất.
    sameSite: "lax",
    maxAge: parseInt(
      process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000
    ), // 7 ngày
    // path: "/", // Set path root để mọi request đều check được nếu cần
    path: "/api/auth",
  });
};

export { generateTokens, setRefreshTokenCookie };
