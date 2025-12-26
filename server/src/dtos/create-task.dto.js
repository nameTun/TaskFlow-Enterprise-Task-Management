/**
 * CreateTaskDto
 * Định nghĩa cấu trúc dữ liệu cần thiết để tạo một Task.
 * Giúp Service không phụ thuộc vào req.body của Express.
 */
class CreateTaskDto {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.startDate = data.startDate;
    this.dueDate = data.dueDate;
    this.assignedTo = data.assignedTo;
    this.teamId = data.teamId;
    this.tags = data.tags; // Nếu có thêm tags
    this.visibility = data.visibility;
  }
}

export default CreateTaskDto;

