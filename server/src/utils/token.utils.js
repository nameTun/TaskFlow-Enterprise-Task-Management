import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.model.js';
import User from '../models/user.model.js'; // Ensure User model is imported if generateTokens needs user details

/**
 * @desc Hàm trợ giúp để tạo Access Token và Refresh Token.
 * Access Token có thời gian sống ngắn, Refresh Token có thời gian sống dài hơn.
 * Refresh Token sẽ được lưu vào cơ sở dữ liệu.
 * @param {object} user Đối tượng người dùng từ MongoDB.
 * @returns {object} Chứa Access Token và Refresh Token.
 */
export const generateTokens = async (user) => {
  // Tạo Access Token: JWT được ký với ID và vai trò của người dùng, hết hạn sau 15 phút (mặc định).
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } // Mặc định 15 phút
  );

  // Tạo Refresh Token: JWT được ký chỉ với ID của người dùng, hết hạn sau 7 ngày (mặc định).
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } // Mặc định 7 ngày
  );

  // Tính toán thời gian hết hạn của Refresh Token bằng milliseconds.
  const refreshTokenExpiresInMs = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000);
  const refreshTokenExpires = new Date(Date.now() + refreshTokenExpiresInMs);

  // Lưu Refresh Token vào cơ sở dữ liệu để có thể quản lý (thu hồi).
  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: refreshTokenExpires,
  });

  return { accessToken, refreshToken };
};
