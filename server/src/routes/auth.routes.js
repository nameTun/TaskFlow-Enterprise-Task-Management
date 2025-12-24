import { Router } from "express";
// Import the new, specific validation middlewares
import {
  validateRegister,
  validateLogin,
} from "../validators/user.validator.js";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  loginGoogle,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// Use the new `validateRegister` middleware which validates and creates a DTO
router.post("/register", validateRegister, register);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
// Use the new `validateLogin` middleware which validates and creates a DTO
router.post("/login", validateLogin, login);

// @route   POST /api/v1/auth/google
// Route này không cần validator username/pass vì nhận token từ Google
router.post("/google", loginGoogle);

// @route   POST /api/auth/logout
// @desc    Đăng xuất người dùng và xóa cookie
// @access  Private (thực tế endpoint này không yêu cầu token để xóa cookie, nhưng hành động là cho người dùng đã đăng nhập)
// Gọi hàm `logout` từ controller để xử lý logic đăng xuất
router.post("/logout", logout);

// @route   POST /api/auth/refresh-token
// @desc    Làm mới access token bằng refresh token
// @access  Public (yêu cầu refresh token trong cookie)
// Gọi hàm `refreshAccessToken` từ controller để xử lý logic làm mới token
router.post("/refresh-token", refreshAccessToken);

// @route   GET /api/v1/auth/me
router.get("/me", protect, getMe);

export default router;
