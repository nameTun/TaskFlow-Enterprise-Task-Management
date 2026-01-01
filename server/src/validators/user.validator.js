import Joi from "joi";
import { BadRequestError } from "../core/error.response.js";
import RegisterUserDto from "../dtos/register-user.dto.js";
import LoginUserDto from "../dtos/login-user.dto.js";

// Schema cho việc đăng ký người dùng
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": "Tên phải là một chuỗi ký tự",
    "string.empty": "Tên không được để trống",
    "string.min": "Tên phải có ít nhất {#limit} ký tự",
    "string.max": "Tên không được vượt quá {#limit} ký tự",
    "any.required": "Tên là trường bắt buộc",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email phải là một địa chỉ hợp lệ",
    "any.required": "Email là trường bắt buộc",
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
    .required()
    .messages({
      "string.pattern.base":
        "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số",
      "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự",
      "any.required": "Mật khẩu là trường bắt buộc",
    }),
});

// Schema cho việc đăng nhập người dùng
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email phải là một địa chỉ hợp lệ",
    "any.required": "Email là trường bắt buộc",
  }),
  password: Joi.string().required().messages({
    "any.required": "Mật khẩu là trường bắt buộc",
  }),
});

/**
 * @desc Middleware để kiểm tra dữ liệu request body với Joi schema và tạo DTO.
 * @param {Joi.Schema} schema Joi schema để kiểm tra dữ liệu.
 * @param {class} DtoClass Lớp DTO để khởi tạo.
 * @returns {function} Middleware của Express.
 */
const validateAndCreateDto = (schema, DtoClass) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    // Nếu kiểm tra thất bại, ném BadRequestError.
    // Middleware xử lý lỗi sẽ bắt và trả về phản hồi.
    throw new BadRequestError(error.details[0].message);
  }
  // Nếu kiểm tra thành công, tạo DTO mới và gắn vào request.
  req.dto = new DtoClass(value);
  next();
};

// Xuất các middleware kiểm tra sẵn sàng sử dụng
export const validateRegister = validateAndCreateDto(
  registerSchema,
  RegisterUserDto
);
export const validateLogin = validateAndCreateDto(loginSchema, LoginUserDto);
