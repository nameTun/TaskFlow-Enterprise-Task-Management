class CommentDto {
    constructor(comment) {
        this._id = comment._id;
        this.taskId = comment.taskId;
        this.content = comment.content;
        this.createdAt = comment.createdAt;
        this.updatedAt = comment.updatedAt;

        if (comment.userId && comment.userId._id) {
            this.user = {
                id: comment.userId._id,
                name: comment.userId.name,
                email: comment.userId.email,
                avatar: comment.userId.avatar
            };
        } else {
            this.user = null; // Or handle as Deleted User
        }

        // Handle mentions if needed (stub)
        this.mentions = comment.mentions || [];
    }
}

export default CommentDto;
