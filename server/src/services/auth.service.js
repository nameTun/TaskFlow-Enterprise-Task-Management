import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/token.utils.js";
import KeyToken from "../models/keyToken.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} from "../core/error.response.js";
import { OAuth2Client } from "google-auth-library"; // Fixed import
import { checkDeadlineAndNotify } from "../helpers/notification.helper.js"; // [NEW] Import helper

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * @desc Register a new user using a DTO.
 * @param {RegisterUserDto} registerUserDto DTO containing user registration data.
 * @returns {object} The registered user object, accessToken, and refreshToken.
 */
const registerUser = async (registerUserDto) => {
  const { name, email, password } = registerUserDto;

  // 1. Check tồn tại
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    throw new BadRequestError("Email này đã được sử dụng");
  }
  // 2. Tạo User
  // LƯU Ý: Không hash password ở đây, User Model pre('save') sẽ tự hash.
  // Map 'password' từ DTO vào 'passwordHash' của Model
  const newUser = await User.create({
    name,
    email,
    passwordHash: password,
    role: "user",
  });

  // 3. Tạo Tokens (Có cơ chế Rollback nếu lỗi)
  try {
    const { accessToken, refreshToken } = await generateTokens(newUser);
    return { user: newUser, accessToken, refreshToken };
  } catch (error) {
    // ROLLBACK: Nếu tạo token lỗi (ví dụ lỗi KeyToken), xóa ngay user vừa tạo
    // để tránh việc user tồn tại nhưng không đăng nhập được, và lần sau đăng ký lại bị báo trùng email.
    await User.findByIdAndDelete(newUser._id);
    throw error; // Ném lỗi tiếp để controller xử lý
  }
};

// **
//  * @desc Đăng nhập hoặc Đăng ký qua Google.
//  * @param {string} credential JWT ID Token từ Google gửi về.
//  */
const loginGoogleUser = async (credential) => {
  try {
    // 1. Verify Token với Google Server
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // payload chứa: email, name, picture, sub (googleId), ...
    const { email, name, picture, sub } = payload;

    // 2. Kiểm tra User có tồn tại không
    let user = await User.findOne({ email });

    if (user) {
      // Case 2.1: User đã tồn tại -> Cập nhật thông tin Google nếu chưa có
      if (!user.googleId) {
        user.googleId = sub;
        user.oauthProvider = "google";
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      // Case 2.2: User chưa tồn tại -> Tạo mới (Password random để không ai login được bằng pass)
      const randomPassword = crypto.randomBytes(16).toString("hex");
      user = await User.create({
        name,
        email,
        passwordHash: randomPassword,
        googleId: sub,
        avatar: picture,
        oauthProvider: "google",
        role: "user", // Default role
        isVerified: true, // Google email luôn verified
      });
    }

    // 3. Tạo Tokens cho hệ thống
    const { accessToken, refreshToken } = await generateTokens(user);

    // [NEW] Trigger Deadline Check
    checkDeadlineAndNotify(user._id);

    return { user, accessToken, refreshToken };
  } catch (error) {
    console.error("Google Auth Error:", error);
    throw new AuthFailureError("Xác thực Google thất bại");
  }
};

/**
 * @desc Authenticate a user using a DTO.
 * @param {LoginUserDto} loginUserDto DTO containing user login credentials.
 * @returns {object} The user object, accessToken, and refreshToken.
 */
const loginUser = async (loginUserDto) => {
  const { email, password } = loginUserDto;
  // 1. Tìm user và lấy cả passwordHash (vì model set select: false)
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !user.passwordHash) {
    throw new AuthFailureError("Thông tin đăng nhập không hợp lệ.");
  }
  // 2. So sánh mật khẩu
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthFailureError("Email hoặc password chưa đúng.");
  }
  // 3. Tạo tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  // [NEW] Trigger Deadline Check
  checkDeadlineAndNotify(user._id);

  return { user, accessToken, refreshToken };
};

/**
 * @desc Xử lý logic đăng xuất người dùng.
 * @param {string} refreshToken Refresh Token của người dùng.
 */

const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    try {
      await KeyToken.deleteOne({ token: refreshToken });
    } catch (error) {
      console.error("Lỗi khi xóa refresh token:", error);
      // Không ném lỗi ra ngoài vì việc đăng xuất không nên thất bại chỉ vì DB lỗi.
    }
  }
};

/**
 * @desc Làm mới Access Token bằng Refresh Token.
 * @param {string} incomingRefreshToken Refresh Token từ client.
 * @returns {object} Access Token và Refresh Token mới.
 */

const refreshUserToken = async (incomingRefreshToken) => {

  if (!incomingRefreshToken) {
    throw new AuthFailureError("Vui lòng đăng nhập lại (No Token)");
  }
  // Tìm trong DB xem token này có tồn tại không
  const storedRefreshToken = await KeyToken.findOne({
    token: incomingRefreshToken,
  });

  if (!storedRefreshToken) {
    // Nếu client gửi token nhưng DB không có -> Có thể token giả hoặc đã bị xóa -> Nghi vấn hack
    // Ở đây có thể thêm logic xóa hết token của user đó để bảo mật
    throw new ForbiddenError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");

  }

  if (
    storedRefreshToken.expiresAt < new Date() ||
    storedRefreshToken.isRevoked
  ) {
    await KeyToken.deleteOne({ _id: storedRefreshToken._id });
    throw new ForbiddenError("Phiên đăng nhập đã hết hạn");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ForbiddenError("Không tìm thấy người dùng");
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    storedRefreshToken.token = refreshToken;
    storedRefreshToken.issuedAt = new Date();
    storedRefreshToken.lastUsedAt = new Date();
    storedRefreshToken.expiresAt = new Date(
      Date.now() +
      parseInt(
        process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000
      )
    );
    await storedRefreshToken.save();

    // [NEW] Trigger Deadline Check (Khi F5 hoặc mở lại app)
    checkDeadlineAndNotify(user._id);

    return { user, accessToken, refreshToken };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      await KeyToken.deleteOne({ token: incomingRefreshToken });
      throw new ForbiddenError("Refresh Token đã hết hạn, vui lòng đăng nhập lại.");
    }
    console.error("Lỗi khi làm mới token trong service:", error);
    throw new Error("Lỗi máy chủ trong quá trình làm mới token");
  }
};
export { registerUser, loginUser, loginGoogleUser, logoutUser, refreshUserToken };
