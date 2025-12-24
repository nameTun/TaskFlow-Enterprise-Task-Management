
import { createTask } from "../services/task.service.js";
import { CREATED } from "../core/success.response.js"; 
import CreateTaskDto from "../dtos/create-task.dto.js"; 
import TaskDto from "../dtos/task.dto.js"; 
import asyncHandler from "../helpers/asyncHandler.js";  
// Tạo task mới
const createTaskController = asyncHandler(async (req, res) => {
  // 1. Map dữ liệu từ Request Body (đã validate sạch) sang DTO chuẩn
  const taskInput = new CreateTaskDto(req.body);

  // 2. Gọi Service với DTO và UserId
  const newTask = await createTask(req.user._id, taskInput);

  // 3. Trả về Response chuẩn với Output DTO
  new CREATED({
    message: "Tạo công việc thành công",
    metadata: new TaskDto(newTask),
  }).send(res);
});

// module.exports = {
//   createTask: createTaskController,
// };
export default createTaskController

