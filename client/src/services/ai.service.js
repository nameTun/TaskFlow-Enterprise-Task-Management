import api from "./api";

const aiService = {
  chat: async (message) => {
    const response = await api.post("/ai/chat", { message });
    return response.data; // Trả về { message, metadata: { reply: "..." } }
  },
};

export default aiService;
