import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { NotFoundError, ForbiddenError } from "../core/error.response.js";
import mongoose from "mongoose";

/**
 * Tạo task mới
 * Service chỉ quan tâm logic tạo data, việc validate input thuộc về Validator/Controller
 */
const createTask = async (userId, taskDto) => {
  if (taskDto.assignedTo) {
    const assignee = await User.findById(taskDto.assignedTo);
    if (!assignee) {
      throw new NotFoundError('Người được giao việc không tồn tại');
    }
  }

  const newTask = await Task.create({
    ...taskDto,
    createdBy: userId,
  });

  return await newTask.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' }
  ]);
};

/**
 * Lấy danh sách task
 * @param {Object} filter - Bộ lọc MongoDB (Đã được Controller dựng sẵn bao gồm cả logic Auth)
 * @param {Object} queryOptions - Các params phân trang, sort ({ page, limit, sort })
 */
const getAllTasks = async (filter, queryOptions) => {
  const { page = 1, limit = 10, sort = 'newest' } = queryOptions;
  const skip = (page - 1) * limit;

  // Xử lý Sort
  let sortCondition = { createdAt: -1 }; 
  if (sort === 'oldest') sortCondition = { createdAt: 1 };
  if (sort === 'priority_desc') sortCondition = { priority: -1 };
  
  const [tasks, totalCount] = await Promise.all([
    Task.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortCondition)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .lean(),
    Task.countDocuments(filter)
  ]);

  return {
    tasks,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Lấy danh sách task đã xóa
 */
const getDeletedTasks = async (filter) => {
  // Service chỉ thực thi filter được truyền vào
  return await Task.find(filter)
    .sort({ deletedAt: -1 })
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("deletedBy", "name email avatar") // Populate thêm người xóa
    .lean();
};

/**
 * Lấy chi tiết Task
 * Service trả về raw document, Controller sẽ check quyền trên document này.
 */
const getTaskById = async (id, withDeleted = false) => {
  const query = mongoose.isValidObjectId(id) 
      ? { _id: id }
      : { taskId: id };

  // Nếu không yêu cầu lấy deleted (mặc định), thì thêm điều kiện deletedAt: null
  if (!withDeleted) {
    query.deletedAt = null;
  }

  const task = await Task.findOne(query)
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

  
  if (!task) {
    throw new NotFoundError('Công việc không tồn tại');
  }

  return task;
};

/**
 * Cập nhật Task
 * Service thực hiện logic update DB thuần túy.
 */
const updateTask = async (taskId, updateData) => {
  // Validate nghiệp vụ (nếu có update người được giao)
  if (updateData.assignedTo) {
     const assignee = await User.findById(updateData.assignedTo);
     if (!assignee) throw new NotFoundError('Người được giao việc không tồn tại');
  }

  const query = mongoose.isValidObjectId(taskId) ? { _id: taskId } : { taskId: taskId };

  const updatedTask = await Task.findOneAndUpdate(query, updateData, {
    new: true, 
    runValidators: true 
  })
  .populate('createdBy', 'name email avatar')
  .populate('assignedTo', 'name email avatar');

  if (!updatedTask) throw new NotFoundError('Công việc không tồn tại');

  return updatedTask;
};

/**
 * Xóa mềm Task (Lưu người xóa))
 */
const deleteTask = async (taskId, userId) => {
  const query = mongoose.isValidObjectId(taskId) ? { _id: taskId } : { taskId: taskId };
  
   const task = await Task.findOneAndUpdate(query, {
     deletedAt: new Date(),
     deletedBy: userId,
   });
  
  if (!task) throw new NotFoundError('Công việc không tồn tại');
  
  return true;
};

/**
 * Khôi phục Task
 */
const restoreTask = async (taskId) => {
  const query = mongoose.isValidObjectId(taskId) ? { _id: taskId } : { taskId: taskId };
  
  const task = await Task.findOneAndUpdate(query, {
    deletedAt: null,
    deletedBy: null,
  });
  if (!task) throw new NotFoundError('Công việc không tồn tại');

  return task;
};


export {
  createTask,
  getAllTasks,
  getDeletedTasks,
  getTaskById,
  updateTask,
  deleteTask,
  restoreTask,
};
