import api from "./api";

const taskService = {
  /**
   * Lấy danh sách tasks
   * @param {Object} params - { page, limit, status, priority, ... }
   */
  getTasks: async (params) => {
    const response = await api.get("/tasks", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết task
   * @param {string} id
   */
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Tạo task mới
   * @param {Object} data
   */
  createTask: async (data) => {
    const response = await api.post("/tasks", data);
    return response.data;
  },
  /**
   * Lấy danh sách tasks đã xóa
   */
  getTrash: async () => {
    const response = await api.get("/tasks/trash");
    return response.data;
  },
  /**
   * Cập nhật task
   * @param {string} id
   * @param {Object} data
   */
  updateTask: async (id, data) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Xóa task
   * @param {string} id
   */
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Khôi phục task
   * @param {string} id
   */
  restoreTask: async (id) => {
    const response = await api.patch(`/tasks/${id}/restore`);
    return response.data;
  },

  /**
   * Xóa vĩnh viễn task
   * @param {string} id
   */
  deletePermanentTask: async (id) => {
    const response = await api.delete(`/tasks/trash/${id}`);
    return response.data;
  },

  /**
   * Thêm subtask
   * @param {string} taskId
   * @param {Object} data - { title }
   */
  addSubTask: async (taskId, data) => {
    const response = await api.post(`/tasks/${taskId}/subtasks`, data);
    return response.data;
  },

  /**
   * Cập nhật subtask
   * @param {string} taskId
   * @param {string} subTaskId
   * @param {Object} data - { title, isCompleted }
   */
  updateSubTask: async (taskId, subTaskId, data) => {
    const response = await api.patch(
      `/tasks/${taskId}/subtasks/${subTaskId}`,
      data
    );
    return response.data;
  },

  /**
   * Xóa subtask
   * @param {string} taskId
   * @param {string} subTaskId
   */
  deleteSubTask: async (taskId, subTaskId) => {
    const response = await api.delete(`/tasks/${taskId}/subtasks/${subTaskId}`);
    return response.data;
  },
};

export default taskService;
