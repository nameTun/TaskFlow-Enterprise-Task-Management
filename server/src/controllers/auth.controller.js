import asyncHandler from "../helpers/asyncHandler.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
} from "../services/auth.service.js";
import { CREATED, OK } from "../core/success.response.js";
import { setRefreshTokenCookie } from "../utils/token.utils.js";
import UserDto from "../dtos/user.dto.js";

// Đăng ký
const register = asyncHandler(async (req, res) => {

  const { user, accessToken, refreshToken } = await registerUser(req.dto);

  setRefreshTokenCookie(res, refreshToken);

  new CREATED({
    message: "Đăng ký thành công",
    metadata: {
      user: new UserDto(user),
      tokens: { accessToken },
    },
  }).send(res);
});

// Đăng nhập
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.dto);

  setRefreshTokenCookie(res, refreshToken);

  new OK({
    message: "Đăng nhập thành công",
    metadata: {
      user: new UserDto(user),
      tokens: { accessToken },
    },
  }).send(res);
});

// Đăng nhập bằng Google
const loginGoogle = asyncHandler(async (req, res) => {
  // Lấy credential (ID Token) từ Body do Client gửi lên
  const { credential } = req.body;

  if (!credential) {
    throw new Error("Không tìm thấy Google Credential");
  }

  const { user, accessToken, refreshToken } = await loginGoogleUser(credential);

  setRefreshTokenCookie(res, refreshToken);

  new OK({
    message: "Đăng nhập Google thành công",
    metadata: {
      user: new UserDto(user),
      tokens: { accessToken },
    },
  }).send(res);
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await logoutUser(refreshToken);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    // path: "/api/auth/refresh-token" // Quan trọng: Path phải khớp với lúc set cookie
  });
  new OK({ message: "Đăng xuất thành công" }).send(res);
});

// Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  const {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  } = await refreshUserToken(incomingRefreshToken);

  setRefreshTokenCookie(res, newRefreshToken);

  // Trả về Access Token và User Info cho Client
  new OK({
    message: "Làm mới phiên đăng nhập thành công",
    metadata: {
      user: new UserDto(user), // Trả về user info để restore state
      tokens: { accessToken },
    },
  }).send(res);
});


// Get Me
const getMe = asyncHandler(async (req, res) => {
  new OK({
    message: "Lấy thông tin thành công",
    metadata: new UserDto(req.user),
  }).send(res);
});
export { register, login, logout, refreshAccessToken, loginGoogle, getMe };
