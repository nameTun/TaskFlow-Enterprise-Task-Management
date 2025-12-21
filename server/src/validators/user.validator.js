import Joi from 'joi';

// Định nghĩa schema xác thực cho việc đăng ký người dùng mới
const registerSchema = Joi.object({
  // Trường `name`: phải là chuỗi, độ dài từ 3 đến 50 ký tự, và là bắt buộc.
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Tên phải là một chuỗi văn bản',
    'string.empty': 'Tên không được để trống',
    'string.min': 'Tên phải có ít nhất {#limit} ký tự',
    'string.max': 'Tên không được vượt quá {#limit} ký tự',
    'any.required': 'Tên là trường bắt buộc',
  }),
  // Trường `email`: phải là chuỗi, định dạng email hợp lệ, và là bắt buộc.
  email: Joi.string().email().required().messages({
    'string.email': 'Email phải là một địa chỉ email hợp lệ',
    'any.required': 'Email là trường bắt buộc',
  }),
  // Trường `password`: phải là chuỗi, độ dài ít nhất 8 ký tự,
  // và phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số. Bắt buộc.
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')).required().messages({
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số',
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'any.required': 'Mật khẩu là trường bắt buộc',
  }),
});

// Định nghĩa schema xác thực cho việc đăng nhập người dùng
const loginSchema = Joi.object({
    // Trường `email`: phải là chuỗi, định dạng email hợp lệ, và là bắt buộc.
    email: Joi.string().email().required().messages({
        'string.email': 'Email phải là một địa chỉ email hợp lệ',
        'any.required': 'Email là trường bắt buộc',
    }),
    // Trường `password`: là bắt buộc.
    password: Joi.string().required().messages({
        'any.required': 'Mật khẩu là trường bắt buộc',
    }),
});


/**
 * @desc Middleware để xác thực body của yêu cầu dựa trên schema Joi cung cấp.
 * @param {Joi.Schema} schema Schema Joi để xác thực.
 * @returns {function} Middleware Express.
 */
const validate = (schema) => (req, res, next) => {
  // Thực hiện xác thực body của yêu cầu với schema đã cho
  const { error } = schema.validate(req.body);
  if (error) {
    // Nếu có lỗi xác thực, trả về lỗi 400 Bad Request
    return res.status(400).json({
      message: error.details[0].message, // Lấy thông báo lỗi chi tiết đầu tiên
    });
  }
  // Nếu không có lỗi, chuyển sang middleware hoặc route handler tiếp theo
  next();
};

export { validate, registerSchema, loginSchema };
