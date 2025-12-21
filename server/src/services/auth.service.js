import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/token.utils.js';
import RefreshToken from '../models/refreshToken.model.js';
import jwt from 'jsonwebtoken';

// Helper function to handle common error responses
class AuthError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * @desc Đăng ký người dùng mới.
 * @param {string} name Tên người dùng.
 * @param {string} email Email người dùng.
 * @param {string} password Mật khẩu người dùng (chưa hash).
 * @returns {object} Đối tượng người dùng đã đăng ký, accessToken và refreshToken.
 */
export const registerUser = async (name, email, password) => {
  let user = await User.findOne({ email });

  if (user) {
    throw new AuthError('Người dùng đã tồn tại', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  user = new User({
    name,
    email,
    passwordHash,
  });

  await user.save();

  const { accessToken, refreshToken } = await generateTokens(user);

  return { user, accessToken, refreshToken };
};

/**
 * @desc Xác thực người dùng.
 * @param {string} email Email người dùng.
 * @param {string} password Mật khẩu người dùng.
 * @returns {object} Đối tượng người dùng, accessToken và refreshToken.
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !user.passwordHash) {
    throw new AuthError('Thông tin đăng nhập không hợp lệ.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthError('Thông tin đăng nhập không hợp lệ.', 401);
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  return { user, accessToken, refreshToken };
};

/**
 * @desc Xử lý logic đăng xuất người dùng.
 * @param {string} refreshToken Refresh Token của người dùng.
 */
export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      console.error('Lỗi khi xóa refresh token:', error);
      // Không ném lỗi ra ngoài vì việc đăng xuất không nên thất bại chỉ vì DB lỗi.
    }
  }
};

/**
 * @desc Làm mới Access Token bằng Refresh Token.
 * @param {string} incomingRefreshToken Refresh Token từ client.
 * @returns {object} Access Token và Refresh Token mới.
 */
export const refreshUserToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new AuthError('Refresh Token bị thiếu', 401);
  }

  const storedRefreshToken = await RefreshToken.findOne({ token: incomingRefreshToken });

  if (!storedRefreshToken) {
    throw new AuthError('Refresh Token không hợp lệ', 403);
  }

  if (storedRefreshToken.expiresAt < new Date() || storedRefreshToken.isRevoked) {
    await RefreshToken.deleteOne({ _id: storedRefreshToken._id });
    throw new AuthError('Refresh Token đã hết hạn hoặc bị thu hồi', 403);
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AuthError('Không tìm thấy người dùng cho refresh token', 403);
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    storedRefreshToken.token = refreshToken;
    storedRefreshToken.issuedAt = new Date();
    storedRefreshToken.lastUsedAt = new Date();
    storedRefreshToken.expiresAt = new Date(Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000));
    await storedRefreshToken.save();

    return { accessToken, refreshToken };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      await RefreshToken.deleteOne({ token: incomingRefreshToken });
      throw new AuthError('Refresh Token đã hết hạn, vui lòng đăng nhập lại.', 403);
    }
    console.error('Lỗi khi làm mới token trong service:', error);
    throw new AuthError('Lỗi máy chủ trong quá trình làm mới token', 500);
  }
};

/**
 * @desc Xử lý callback xác thực Google OAuth.
 * @param {object} user Đối tượng người dùng từ Passport.
 * @returns {object} Đối tượng người dùng, accessToken và refreshToken.
 */
export const handleGoogleAuth = async (user) => {
  if (!user) {
    throw new AuthError('Xác thực Google thất bại', 401);
  }
  const { accessToken, refreshToken } = await generateTokens(user);
  return { user, accessToken, refreshToken };
};
