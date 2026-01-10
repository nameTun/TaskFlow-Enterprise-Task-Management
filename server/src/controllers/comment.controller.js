import CommentService from "../services/comment.service.js";
import CommentDto from "../dtos/comment.dto.js";
import { OK, CREATED } from "../core/success.response.js";
import asyncHandler from "../helpers/asyncHandler.js";

const getComments = asyncHandler(async (req, res) => {
    const comments = await CommentService.getCommentsByTask(req.params.taskId);
    const commentsDto = comments.map(c => new CommentDto(c));

    new OK({
        message: "Get comments success",
        metadata: commentsDto
    }).send(res);
});

const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { taskId } = req.params;

    const newComment = await CommentService.createComment(req.user._id, taskId, content);

    new CREATED({
        message: "Comment created",
        metadata: new CommentDto(newComment)
    }).send(res);
});

const deleteComment = asyncHandler(async (req, res) => {
    await CommentService.deleteComment(req.user._id, req.params.commentId);

    new OK({
        message: "Comment deleted"
    }).send(res);
});

export default {
    getComments,
    createComment,
    deleteComment
};
