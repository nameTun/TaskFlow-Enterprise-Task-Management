import asyncHandler from '../helpers/asyncHandler.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  // handleGoogleAuth,
} from '../services/auth.service.js';
import { CREATED, OK } from '../core/success.response.js';
import { setRefreshTokenCookie } from '../utils/token.utils.js';
import UserDto from '../dtos/user.dto.js';

export const register = asyncHandler(async (req, res) => {
  // Data is now in req.dto, validated and created by the middleware
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

export const login = asyncHandler(async (req, res) => {
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
export const loginGoogle = asyncHandler(async (req, res) => {
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

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await logoutUser(refreshToken);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh-token" // Quan trọng: Path phải khớp với lúc set cookie
  });
  // No longer need to clear accessToken cookie
  new OK({ message: "Đăng xuất thành công" }).send(res);
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await refreshUserToken(
    incomingRefreshToken
  );

  // Use the helper function to set the new refresh token in the cookie
  setRefreshTokenCookie(res, newRefreshToken);

  // The new access token is returned in the body
  new OK({
    message: "Làm mới token thành công",
    metadata: { accessToken },
  }).send(res);
});

// export const googleAuthCallback = asyncHandler(async (req, res) => {
//   const { user, accessToken, refreshToken } = await handleGoogleAuth(req.user);
//   setRefreshTokenCookie(res, refreshToken);
//   // Redirecting the user. The client will not receive the accessToken directly here.
//   // The client is expected to have logic to fetch the user/token after redirection,
//   // possibly by using the refresh token that was just set.
//   res.redirect(process.env.CLIENT_URL);
// });

// Get Me
export const getMe = asyncHandler(async (req, res) => {
  new OK({
    message: "Lấy thông tin thành công",
    metadata: new UserDto(req.user),
  }).send(res);
});
