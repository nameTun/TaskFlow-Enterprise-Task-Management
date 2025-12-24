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
};

export default taskService;
