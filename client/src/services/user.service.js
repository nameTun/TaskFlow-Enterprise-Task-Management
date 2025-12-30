import api from "./api";

const userService = {
  getAllUsers: async (params) => {
    // params: { page, limit, q, role }
    const response = await api.get("/users", { params });
    return response.data;
  },
  createUser: async (data) => {
    const response = await api.post("/users", data);
    return response.data;
  },
  
  searchUsers: async (query) => {
    const response = await api.get("/users/search", { params: { q: query } });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/users/${userId}`, { role });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export default userService;
