import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../core/error.response.js";
import mongoose from "mongoose";

/**
 * Tạo task mới
 */
const createTask = async (userId, taskDto) => {
  // Lấy thông tin người tạo để check team
  const creator = await User.findById(userId);

  // 1. Tự động gắn Task vào Team của người tạo (nếu có)
  if (creator.teamId && !taskDto.teamId) {
    taskDto.teamId = creator.teamId;
    if (!taskDto.visibility) taskDto.visibility = "team";
  }

  // 2. Validate Priority
  if (taskDto.priority && !["low", "medium", "high", "urgent"].includes(taskDto.priority)) {
    taskDto.priority = "medium"; // Fallback nếu gửi linh tinh
  }

  // 3. Validate Assignee (Chống giao việc xuyên team & Logic Privacy)
  let isAssignedToOther = false;
  if (taskDto.assignedTo) {
    // Nếu tự giao cho mình thì không tính là "giao cho người khác"
    if (taskDto.assignedTo.toString() !== userId.toString()) {
      isAssignedToOther = true;

      // RULE: User thường (member) không được giao việc cho người khác
      // Chỉ Admin hoặc Team Lead mới được giao việc
      if (creator.role !== 'admin' && creator.role !== 'team_lead') {
        throw new ForbiddenError("Bạn chỉ có thể tạo công việc cho chính mình.");
      }
    }

    // NGHIỆP VỤ MỚI: Nếu visibility là Private -> Không được giao cho người khác
    if (taskDto.visibility === "private" && isAssignedToOther) {
      throw new BadRequestError("Task riêng tư (Private) thì không thể giao cho người khác!");
    }

    const assignee = await User.findById(taskDto.assignedTo);
    if (!assignee) {
      throw new NotFoundError("Người được giao việc không tồn tại");
    }

    // Logic Check Team:
    // Nếu Creator là Admin -> Bỏ qua check team (Admin is GOD)
    // Nếu Creator KHÔNG phải Admin -> Bắt buộc Assignee phải cùng Team
    if (creator.role !== "admin" && creator.teamId) {
      if (
        !assignee.teamId ||
        assignee.teamId.toString() !== creator.teamId.toString()
      ) {
        throw new ForbiddenError(
          "Không thể giao việc cho thành viên không thuộc nhóm của bạn"
        );
      }
    }
  }

  const newTask = await Task.create({
    ...taskDto,
    createdBy: userId,
  });

  // 4. Tạo Notification nếu giao việc cho người khác
  if (isAssignedToOther && taskDto.assignedTo) {
    // Import dynamic để tránh Circular Dependency nếu cần, hoặc giả sử Notification Model đã có
    // Tạm thời comment logic này để implement chi tiết ở bước sau (Notification Service)
    // await NotificationService.createNotification({
    //   recipientId: taskDto.assignedTo,
    //   senderId: userId,
    //   type: 'ASSIGN_TASK',
    //   taskId: newTask._id,
    //   message: `${creator.name} đã giao cho bạn công việc: ${newTask.title}`
    // });
    /**
     * NOTE: Logic Notification sẽ được thêm vào ở Phase tiếp theo.
     * Hiện tại ta chỉ đảm bảo Task được tạo đúng đã.
     */
  }

  return await newTask.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "assignedTo", select: "name email avatar" },
  ]);
};

/**
 * Lấy danh sách task (Hỗ trợ Search Text)
 */
const getAllTasks = async (filter, queryOptions) => {
  const { page = 1, limit = 10, sort = "newest", search } = queryOptions;
  const skip = (page - 1) * limit;

  // Nếu có từ khóa search -> Thêm điều kiện $text vào filter
  if (search && search.trim() !== "") {
    filter.$text = { $search: search };
  }

  let sortCondition = { createdAt: -1 };
  if (sort === "oldest") sortCondition = { createdAt: 1 };
  if (sort === "priority_desc") sortCondition = { priority: -1 };
  if (sort === "deadline_soon") sortCondition = { dueDate: 1 };

  // Nếu đang search text, MongoDB khuyến nghị sort theo score độ khớp
  if (filter.$text) {
    sortCondition = { score: { $meta: "textScore" } };
  }

  const [tasks, totalCount] = await Promise.all([
    Task.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortCondition)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};
/**
 * Lấy danh sách task đã xóa
 */
const getDeletedTasks = async (filter) => {
  return await Task.find(filter)
    .sort({ deletedAt: -1 })
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("deletedBy", "name email avatar")
    .lean();
};

/**
 * Lấy chi tiết Task
 */
const getTaskById = async (id, withDeleted = false) => {
  // có thể truy vấn DB bằng 2 cách: dùng mã ObjectId hoặc là taskID
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { taskId: id };

  if (!withDeleted) {
    query.deletedAt = null;
  }

  const task = await Task.findOne(query)
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar");

  if (!task) {
    throw new NotFoundError("Công việc không tồn tại");
  }

  return task;
};

/**
 * Cập nhật Task
 */
const updateTask = async (taskId, updateData) => {
  // Validate nghiệp vụ assign khi update
  if (updateData.assignedTo) {
    const assignee = await User.findById(updateData.assignedTo);
    if (!assignee)
      throw new NotFoundError("Người được giao việc không tồn tại");

    // Logic check team khi update assignee cũng nên có, nhưng tạm thời bỏ qua cho đơn giản
    // hoặc cần lấy task hiện tại ra để so sánh teamId
  }

  const query = mongoose.isValidObjectId(taskId)
    ? { _id: taskId }
    : { taskId: taskId };

  const updatedTask = await Task.findOneAndUpdate(query, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("createdBy", "name email avatar")
    .populate("assignedTo", "name email avatar");

  if (!updatedTask) throw new NotFoundError("Công việc không tồn tại");

  return updatedTask;
};

/**
 * Xóa mềm Task
 */
const deleteTask = async (taskId, userId) => {
  const query = mongoose.isValidObjectId(taskId)
    ? { _id: taskId }
    : { taskId: taskId };

  const task = await Task.findOneAndUpdate(query, {
    deletedAt: new Date(),
    deletedBy: userId,
  });

  if (!task) throw new NotFoundError("Công việc không tồn tại");

  return true;
};

/**
 * Khôi phục Task
 */
const restoreTask = async (taskId) => {
  const query = mongoose.isValidObjectId(taskId)
    ? { _id: taskId }
    : { taskId: taskId };

  const task = await Task.findOneAndUpdate(query, {
    deletedAt: null,
    deletedBy: null,
  });
  if (!task) throw new NotFoundError("Công việc không tồn tại");

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
