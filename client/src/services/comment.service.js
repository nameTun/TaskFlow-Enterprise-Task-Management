import api from "./api";

const commentService = {
    getComments: async (taskId) => {
        const response = await api.get(`/comments/${taskId}`);
        return response.data;
    },
    createComment: async (taskId, content) => {
        const response = await api.post(`/comments/${taskId}`, { content });
        return response.data;
    },
    deleteComment: async (commentId) => {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },
};

export default commentService;
