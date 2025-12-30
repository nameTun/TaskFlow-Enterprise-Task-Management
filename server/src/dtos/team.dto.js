class TeamDto {
  constructor(team) {
    this.id = team._id;
    this.name = team.name;
    this.description = team.description;
    this.memberCount = team.members ? team.members.length : 0;

    // Chỉ map thông tin cơ bản của members để tránh lộ hash password
    this.members = team.members
      ? team.members.map((m) => ({
          userId: m.userId._id || m.userId,
          name: m.userId.name,
          email: m.userId.email,
          avatar: m.userId.avatar,
          role: m.role, // member/viewer
          joinedAt: m.joinedAt,
        }))
      : [];

    if (team.leadId) {
      this.lead = {
        id: team.leadId._id || team.leadId,
        name: team.leadId.name,
        email: team.leadId.email,
        avatar: team.leadId.avatar,
      };
    }
  }
}

export default TeamDto;
//
