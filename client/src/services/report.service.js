import api from "./api";

const reportService = {
  getDashboardStats: async () => {
    const response = await api.get("/reports/dashboard");
    return response.data;
  },
};

export default reportService;
