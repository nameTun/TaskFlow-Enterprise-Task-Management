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
  tags: Joi.array().items(Joi.string().trim()),
  visibility: Joi.string()
    .valid("private", "team", "public")
    .default("private"),
});

// Schema validate khi update Task (Tất cả field đều optional)
const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().trim().allow("").max(2000),
  status: Joi.string().valid("todo", "in_progress", "review", "done"),
  priority: Joi.string().valid("low", "medium", "high", "urgent"),
  startDate: Joi.date().iso(),
  dueDate: Joi.date().iso(), // Update thì không bắt buộc phải > now (trừ logic nghiệp vụ đặc thù)
  assignedTo: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null), // Cho phép unassign
  tags: Joi.array().items(Joi.string().trim()),
  visibility: Joi.string().valid("private", "team", "public"),
});

/**
 * Middleware validate Create Task
 */
const validateCreateTask = (req, res, next) => {
  const { error, value } = createTaskSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    throw new BadRequestError(errorMessage);
  }
  req.body = value;
  next();
};

/**
 * Middleware validate Update Task
 */
const validateUpdateTask = (req, res, next) => {
  const { error, value } = updateTaskSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    throw new BadRequestError(errorMessage);
  }
  req.body = value;
  next();
};

export { validateCreateTask, validateUpdateTask };
