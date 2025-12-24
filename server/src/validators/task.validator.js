
import Joi from "joi";
import { BadRequestError } from "../core/error.response.js";

// Schema validate khi tạo Task
const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.base": "Tiêu đề phải là chuỗi ký tự",
    "string.empty": "Tiêu đề không được để trống",
    "string.min": "Tiêu đề phải có ít nhất {#limit} ký tự",
    "string.max": "Tiêu đề không được vượt quá {#limit} ký tự",
    "any.required": "Vui lòng nhập tiêu đề công việc",
  }),
  description: Joi.string().trim().allow("").max(2000),
  status: Joi.string()
    .valid("todo", "in_progress", "review", "done")
    .default("todo"),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .default("medium"),
  startDate: Joi.date().iso().messages({
    "date.format": "Ngày bắt đầu không đúng định dạng ISO",
  }),
  dueDate: Joi.date().iso().greater("now").messages({
    "date.format": "Ngày hết hạn không đúng định dạng ISO",
    "date.greater": "Ngày hết hạn phải lớn hơn thời điểm hiện tại",
  }),
  assignedTo: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base":
        "ID người được giao không hợp lệ (MongoDB ObjectId)",
    }),
  teamId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "ID team không hợp lệ",
    }),
});

/**
 * Middleware validate request body cho create task
 */
const validateCreateTask = (req, res, next) => {
  const { error, value } = createTaskSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // Loại bỏ các field không có trong schema để bảo mật
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    throw new BadRequestError(errorMessage);
  }

  // Gán lại value đã validate và clean vào body
  req.body = value;
  next();
};

export {
  validateCreateTask,
};
