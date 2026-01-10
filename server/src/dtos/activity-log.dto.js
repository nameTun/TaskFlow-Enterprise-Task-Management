class ActivityLogDto {
    constructor(log) {
        this._id = log._id;
        this.taskId = log.taskId;
        this.action = log.action;
        this.content = log.content;
        this.createdAt = log.createdAt;

        if (log.actorId && log.actorId._id) {
            this.actor = {
                id: log.actorId._id,
                name: log.actorId.name,
                email: log.actorId.email,
                avatar: log.actorId.avatar
            };
        } else {
            this.actor = { name: "Unknown" };
        }
    }
}

export default ActivityLogDto;
