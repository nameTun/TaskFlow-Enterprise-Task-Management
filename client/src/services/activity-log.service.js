import api from "./api";

const activityLogService = {
    getLogs: async (taskId) => {
        const response = await api.get(`/activity-logs/${taskId}`);
        return response.data;
    },
};

export default activityLogService;
