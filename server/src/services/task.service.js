
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { NotFoundError, BadRequestError } from "../core/error.response.js";

/**
 * Tạo task mới
 * @param {string} userId - ID người tạo
 * @param {CreateTaskDto} taskDto - Dữ liệu task chuẩn từ DTO
 */
const createTask = async (userId, taskDto) => {
  // 1. Logic nghiệp vụ: Kiểm tra người được giao việc (nếu có)
  if (taskDto.assignedTo) {
    const assignee = await User.findById(taskDto.assignedTo);
    if (!assignee) {
      throw new NotFoundError('Người được giao việc không tồn tại');
    }
  }

  // 2. Tạo Task từ DTO
  // Spread taskDto ra để lấy các field đã định nghĩa trong class DTO
  const newTask = await Task.create({
    ...taskDto,
    createdBy: userId,
  });

  // 3. Populate thông tin để trả về đầy đủ
  const populatedTask = await newTask.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' }
  ]);

  return populatedTask;
};

export {
  createTask,
};