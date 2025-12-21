import { registerUser, loginUser, logoutUser, refreshUserToken, handleGoogleAuth } from '../services/auth.service.js';

/**
 * @desc Đăng ký người dùng mới.
 * @route POST /api/auth/signup
 * @access Public
 * @param {object} req Đối tượng yêu cầu.
 * @param {object} res Đối tượng phản hồi.
 */
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { user, accessToken, refreshToken } = await registerUser(name, email, password);
    // Đặt Refresh Token vào cookie HTTP-only để bảo mật
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000),
      path: '/api/auth/refresh-token',
      sameSite: 'strict',
    });

    // Gửi phản hồi thành công về client
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'AuthError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

/**
 * @desc Xác thực người dùng và cấp token.
 * @route POST /api/auth/login
 * @access Public
 * @param {object} req Đối tượng yêu cầu.
 * @param {object} res Đối tượng phản hồi.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { user, accessToken, refreshToken } = await loginUser(email, password);

    // Đặt Access Token vào cookie HTTP-only
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_EXPIRES_IN_MS || 15 * 60 * 1000), // 15 phút
    });

    // Đặt Refresh Token vào cookie HTTP-only (chỉ gửi đến path refresh-token)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000), // 7 ngày
      path: '/api/auth/refresh-token',
    });

    // Gửi phản hồi thành công
    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'AuthError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đăng nhập.' });
  }
};

/**
 * @desc Đăng xuất người dùng, xóa cookie và thu hồi Refresh Token từ DB.
 * @route POST /api/auth/logout
 * @access Private (nhưng có thể truy cập để xóa cookie)
 * @param {object} req Đối tượng yêu cầu.
 * @param {object} res Đối tượng phản hồi.
 */
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    await logoutUser(refreshToken);

    // Xóa Access Token cookie
    res.clearCookie('accessToken', { path: '/' });
    // Xóa Refresh Token cookie từ đường dẫn cụ thể
    res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
    res.status(200).json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    // Vẫn trả về 200 OK ngay cả khi có lỗi xóa refresh token từ DB
    // vì người dùng đã được logout về phía client (cookie đã xóa)
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
    res.status(200).json({ message: 'Đăng xuất thành công, nhưng có lỗi khi thu hồi token.' });
  }
};

/**
 * @desc Callback xử lý sau khi xác thực Google OAuth.
 * @route GET /api/auth/google/callback
 * @access Public
 * @param {object} req Đối tượng yêu cầu (chứa thông tin người dùng từ Passport).
 * @param {object} res Đối tượng phản hồi.
 */
export const googleAuthCallback = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await handleGoogleAuth(req.user);

    // Đặt Access Token vào cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_EXPIRES_IN_MS || 15 * 60 * 1000), // 15 phút
    });

    // Đặt Refresh Token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000), // 7 ngày
      path: '/api/auth/refresh-token',
    });

    // Chuyển hướng người dùng về ứng dụng frontend sau khi đăng nhập thành công
    res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.error('Lỗi trong quá trình tạo token sau xác thực Google:', error);
    if (error.name === 'AuthError') {
      return res.redirect(`/login?error=${error.message}`);
    }
    res.redirect('/login?error=auth_failed');
  }
};

/**
 * @desc Làm mới Access Token sử dụng Refresh Token.
 * @route POST /api/auth/refresh-token
 * @access Public (yêu cầu Refresh Token trong cookie)
 * @param {object} req Đối tượng yêu cầu.
 * @param {object} res Đối tượng phản hồi.
 */
export const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  try {
    const { accessToken, refreshToken } = await refreshUserToken(incomingRefreshToken);

    // Đặt Access Token mới vào cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_EXPIRES_IN_MS || 15 * 60 * 1000), // 15 phút
    });

    // Đặt Refresh Token mới vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MS || 7 * 24 * 60 * 60 * 1000), // 7 ngày
      path: '/api/auth/refresh-token',
    });

    res.json({ accessToken }); // Gửi Access Token mới về client
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error);
    if (error.name === 'AuthError') {
      // Nếu Refresh Token cũng hết hạn, xóa cookie và yêu cầu đăng nhập lại
      if (error.message.includes('hết hạn')) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
      }
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình làm mới token' });
  }
};