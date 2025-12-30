import api from "./api";

const teamService = {
  getMyTeam: async () => {
    const response = await api.get("/teams/me");
    return response.data;
  },

  createTeam: async (data) => {
    const response = await api.post("/teams", data);
    return response.data;
  },

  inviteMember: async (email) => {
    const response = await api.post("/teams/invite", { email });
    return response.data;
  },

  respondInvite: async (notificationId, accept) => {
    const response = await api.post("/teams/respond-invite", {
      notificationId,
      accept,
    });
    return response.data;
  },

  removeMember: async (memberId) => {
    const response = await api.delete(`/teams/members/${memberId}`);
    return response.data;
  },
  
  leaveTeam: async () => {
    const response = await api.post("/teams/leave");
    return response.data;
  },
};

export default teamService;
