import {
  createTask,
  getAllTasks,
  getDeletedTasks,
  getTaskById,
  updateTask,
  deleteTask,
  restoreTask,
} from "../services/task.service.js";
import { CREATED, OK } from "../core/success.response.js";
import CreateTaskDto from "../dtos/create-task.dto.js";
import TaskDto from "../dtos/task.dto.js";
import asyncHandler from "../helpers/asyncHandler.js";
import { TaskPolicy, ensure } from "../policies/task.policy.js";

// Tạo task mới
const createTaskController = asyncHandler(async (req, res) => {
  const taskInput = new CreateTaskDto(req.body);
  const newTask = await createTask(req.user.id, taskInput);

  new CREATED({
    message: "Tạo công việc thành công",
    metadata: new TaskDto(newTask),
  }).send(res);
});

// Lấy danh sách task (Dashboard)
const getAllTasksController = asyncHandler(async (req, res) => {
  // Policy: Lấy filter quyền xem
  const authFilter = TaskPolicy.getReadFilter(req.user);

  // Combine với filter từ Client
  const dataFilter = { deletedAt: null, ...authFilter };

  // Dùng nếu người dùng lọc filter
  if (req.query.status) dataFilter.status = req.query.status;
  if (req.query.priority) dataFilter.priority = req.query.priority;
  if (req.query.search) dataFilter.$text = { $search: req.query.search };

  const result = await getAllTasks(dataFilter, req.query);

  const tasksDto = result.tasks.map((task) => new TaskDto(task));

  new OK({
    message: "Lấy danh sách công việc thành công",
    metadata: {
      tasks: tasksDto,
      pagination: result.meta,
    },
  }).send(res);
});

// Lấy danh sách thùng rác
const getTrashController = asyncHandler(async (req, res) => {
  const authFilter = TaskPolicy.getReadFilter(req.user);
  const filter = { deletedAt: { $ne: null }, ...authFilter };

  const tasks = await getDeletedTasks(filter);
  const tasksDto = tasks.map((task) => new TaskDto(task));


  new OK({
    message: "Lấy thùng rác thành công",
    metadata: tasksDto,
  }).send(res);
});

// Lấy chi tiết task
const getTaskByIdController = asyncHandler(async (req, res) => {
  const withDeleted = req.query.with_deleted === 'true';
  const task = await getTaskById(req.params.id, withDeleted);

  // Policy Check: VIEW
  ensure("VIEW", req.user, task);

  new OK({
    message: "Lấy thông tin công việc thành công",
    metadata: new TaskDto(task),
  }).send(res);
});

// Cập nhật task
const updateTaskController = asyncHandler(async (req, res) => {
  const task = await getTaskById(req.params.id);

  // Policy Check: UPDATE
  ensure("UPDATE", req.user, task);

  const updatedTask = await updateTask(req.params.id, req.body);

  new OK({
    message: "Cập nhật công việc thành công",
    metadata: new TaskDto(updatedTask),
  }).send(res);
});

// Xóa task
const deleteTaskController = asyncHandler(async (req, res) => {
  const task = await getTaskById(req.params.id);

  // Policy Check: DELETE
  ensure("DELETE", req.user, task);

  await deleteTask(req.params.id, req.user._id);

  new OK({
    message: "Xóa công việc thành công",
  }).send(res);
});

// Khôi phục task
const restoreTaskController = asyncHandler(async (req, res) => {
  const task = await getTaskById(req.params.id, true);

  // Policy Check: DELETE (Quyền restore thường gắn liền quyền delete hoặc admin)
  ensure("DELETE", req.user, task);

  await restoreTask(req.params.id);

  new OK({
    message: "Khôi phục công việc thành công",
  }).send(res);
});
export {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  getTrashController,
  restoreTaskController,

};
