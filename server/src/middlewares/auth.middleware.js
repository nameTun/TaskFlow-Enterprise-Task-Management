import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { AuthFailureError, ForbiddenError } from "../core/error.response.js"


/**
 * @desc Middleware xác minh Access Token từ người dùng.
 * Token có thể được gửi trong cookie hoặc header Authorization.
 * Nếu token hợp lệ, thông tin người dùng sẽ được đính kèm vào req.user.
 * @param {object} req Đối tượng yêu cầu.
 * @param {object} res Đối tượng phản hồi.
 * @param {function} next Hàm middleware tiếp theo.
 */
const protect = async (req, res, next) => {
  let token;
  // Chỉ kiểm tra token trong header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Lấy phần token sau 'Bearer '
    
  }

  // Nếu không tìm thấy token nào
  if (!token) {
    throw new AuthFailureError(
      "Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập."
    );
  }

  try {
    // Xác minh tính hợp lệ của token bằng secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm người dùng dựa trên ID từ token đã giải mã
    // Bỏ qua trường passwordHash để không trả về mật khẩu
    // gắn thêm thông tin user cho bất khi request nào từ client gửi xuống nếu cần xác thực
    req.user = await User.findById(decoded.id).select('-passwordHash');

    // Nếu không tìm thấy người dùng
    if (!req.user) {
        return res.status(401).json({ message: 'Không được ủy quyền, không tìm thấy người dùng.' });
    }

    // Nếu token hợp lệ và người dùng được tìm thấy, chuyển sang middleware hoặc route handler tiếp theo
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AuthFailureError(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
    }
    throw new AuthFailureError(
      "Token không hợp lệ hoặc phiên đăng nhập bị lỗi."
    );
  }
};

/**
 * Middleware phân quyền (Authorization)
 * Chỉ cho phép các role được truyền vào danh sách tham số.
 * Ví dụ: restrictTo('admin', 'team_lead')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user đã được gán từ middleware protect chạy trước đó
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${roles.join(
          ", "
        )}`
      );
    }
    next();
  };
};

export { protect, restrictTo };
