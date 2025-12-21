import { Router } from 'express';
// Nhập các schema validation và middleware validate từ user.validator.js
import { validate, registerSchema, loginSchema } from '../validators/user.validator.js';
// Nhập các hàm xử lý xác thực từ auth.controller.js
import { signup, login, googleAuthCallback, logout, refreshAccessToken } from '../controllers/auth.controller.js';
// Nhập passport để sử dụng trong xác thực Google OAuth
import passport from 'passport';

const router = Router(); // Tạo một đối tượng Router

// @route   POST /api/auth/register
// @desc    Đăng ký người dùng mới
// @access  Public
// Sử dụng middleware `validate` với `registerSchema` để xác thực dữ liệu đầu vào
// Sau đó gọi hàm `signup` từ controller để xử lý logic đăng ký
router.post('/register', validate(registerSchema), signup);

// @route   POST /api/auth/login
// @desc    Xác thực người dùng và cấp token
// @access  Public
// Sử dụng middleware `validate` với `loginSchema` để xác thực dữ liệu đầu vào
// Sau đó gọi hàm `login` từ controller để xử lý logic đăng nhập
router.post('/login', validate(loginSchema), login);

// @route   POST /api/auth/logout
// @desc    Đăng xuất người dùng và xóa cookie
// @access  Private (thực tế endpoint này không yêu cầu token để xóa cookie, nhưng hành động là cho người dùng đã đăng nhập)
// Gọi hàm `logout` từ controller để xử lý logic đăng xuất
router.post('/logout', logout);

// @route   GET /api/auth/google
// @desc    Bắt đầu quá trình xác thực với Google
// @access  Public
// Gọi `passport.authenticate('google')` để chuyển hướng người dùng đến trang đăng nhập Google
// `scope` định nghĩa thông tin chúng ta muốn lấy từ Google (profile và email)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Callback URL sau khi Google xác thực
// @access  Public
// `passport.authenticate('google')` xử lý phản hồi từ Google
// `failureRedirect: '/login'` nếu xác thực thất bại, chuyển hướng về trang login
// `session: false` vì chúng ta sử dụng JWT, không cần session của Passport
// Sau khi xác thực thành công, gọi hàm `googleAuthCallback` từ controller
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleAuthCallback
);

// @route   POST /api/auth/refresh-token
// @desc    Làm mới access token bằng refresh token
// @access  Public (yêu cầu refresh token trong cookie)
// Gọi hàm `refreshAccessToken` từ controller để xử lý logic làm mới token
router.post('/refresh-token', refreshAccessToken);

export default router;
