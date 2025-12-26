class TaskDto {
  constructor(task) {
    this.id = task.taskId; // Sử dụng Short ID (TASK-xxxx)
    this._id = task._id; // Giữ lại ObjectID cho các thao tác nội bộ nếu cần
    this.title = task.title;
    this.description = task.description;
    this.status = task.status;
    this.priority = task.priority;
    this.startDate = task.startDate;
    this.dueDate = task.dueDate;
    this.completedAt = task.completedAt;

    // Format thông tin người tạo (nếu đã populate)
    if (task.createdBy && task.createdBy._id) {
      this.createdBy = {
        id: task.createdBy._id,
        name: task.createdBy.name,
        email: task.createdBy.email,
        avatar: task.createdBy.avatar,
      };
    } else {
      this.createdBy = task.createdBy; // Trường hợp chưa populate
    }

    // Format thông tin người được giao (nếu có và đã populate)
    if (task.assignedTo && task.assignedTo._id) {
      this.assignedTo = {
        id: task.assignedTo._id,
        name: task.assignedTo.name,
        email: task.assignedTo.email,
        avatar: task.assignedTo.avatar,
      };
    } else {
      this.assignedTo = task.assignedTo;
    }

    // Format thông tin người xóa (nếu có và đã populate)
    if (task.deletedBy && task.deletedBy._id) {
      this.deletedBy = {
        id: task.deletedBy._id,
        name: task.deletedBy.name,
        email: task.deletedBy.email,
        avatar: task.deletedBy.avatar,
      };
    } else {
      this.deletedBy = task.deletedBy;
    }

    this.teamId = task.teamId;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;
    this.deletedAt = task.deletedAt; // Thêm trường này để frontend hiển thị ngày xóa
  }
}

export default TaskDto;
