import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * @desc Middleware xác minh Access Token từ người dùng.
 * Token có thể được gửi trong cookie hoặc header Authorization.
 * Nếu token hợp lệ, thông tin người dùng sẽ được đính kèm vào req.user.
 * @param {object} req Đối tượng yêu cầu.
 * @param {object} res Đối tượng phản hồi.
 * @param {function} next Hàm middleware tiếp theo.
 */
const verifyToken = async (req, res, next) => {
  let token;

  // 1. Kiểm tra Access Token trong cookies trước
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Nếu không có trong cookie, kiểm tra trong header Authorization (dạng Bearer token)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Lấy phần token sau 'Bearer '
  }

  // Nếu không tìm thấy token nào
  if (!token) {
    return res.status(401).json({ message: 'Không được ủy quyền, không có token nào được cung cấp.' });
  }

  try {
    // 3. Xác minh tính hợp lệ của token bằng secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Tìm người dùng dựa trên ID từ token đã giải mã
    // Bỏ qua trường passwordHash để không trả về mật khẩu
    req.user = await User.findById(decoded.id).select('-passwordHash');

    // Nếu không tìm thấy người dùng
    if (!req.user) {
        return res.status(401).json({ message: 'Không được ủy quyền, không tìm thấy người dùng.' });
    }

    // Nếu token hợp lệ và người dùng được tìm thấy, chuyển sang middleware hoặc route handler tiếp theo
    next();
  } catch (error) {
    // Xử lý các lỗi liên quan đến token (hết hạn, không hợp lệ, v.v.)
    return res.status(401).json({ message: 'Không được ủy quyền, token không hợp lệ hoặc đã hết hạn.' });
  }
};


const authorizeRoles = (allowedRoles) => (req, res, next) => {
  // Kiểm tra xem thông tin người dùng đã được đính kèm vào req chưa (tức là đã qua verifyToken)
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: 'Không có quyền truy cập, thông tin vai trò người dùng không có sẵn.' });
  }

  // Kiểm tra xem vai trò của người dùng có nằm trong danh sách các vai trò được phép hay không
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: `Không có quyền truy cập, vai trò của bạn (${req.user.role}) không được phép truy cập tài nguyên này.` });
  }

  // Nếu người dùng có vai trò được phép, chuyển sang middleware hoặc route handler tiếp theo
  next();
};

export { verifyToken, authorizeRoles };
