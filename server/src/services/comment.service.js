import Comment from "../models/comment.model.js";
import ActivityLogService from "./activity-log.service.js";
import NotificationService from "./notification.service.js";
import Task from "../models/task.model.js";
import { NotFoundError, ForbiddenError } from "../core/error.response.js";
import mongoose from "mongoose";

const createComment = async (userId, taskId, content) => {
    // 1. Create Comment
    const comment = await Comment.create({
        userId,
        taskId,
        content
    });

    // Populate user info immediately for display
    await comment.populate("userId", "name email avatar");

    // 2. Log this activity
    ActivityLogService.logActivity(userId, taskId, "COMMENT", { commentId: comment._id });

    // 3. Notify relevant users
    try {
        const task = await Task.findById(taskId).select("assignedTo createdBy title teamId");
        if (task) {
            const sender = comment.userId;
            const recipients = new Set();

            // Notify Assignee
            if (task.assignedTo && task.assignedTo.toString() !== userId.toString()) {
                recipients.add(task.assignedTo.toString());
            }

            // Notify Creator (if distinct)
            if (task.createdBy && task.createdBy.toString() !== userId.toString()) {
                recipients.add(task.createdBy.toString());
            }

            // Send notifications
            const notificationPromises = Array.from(recipients).map(recipientId =>
                NotificationService.createNotification({
                    recipientId,
                    senderId: userId,
                    type: 'COMMENT',
                    title: 'Bình luận mới',
                    message: `${sender.name} đã bình luận trong công việc: ${task.title}`,
                    payload: {
                        taskId: task._id,
                        teamId: task.teamId
                    }
                })
            );

            // Run in background
            Promise.all(notificationPromises).catch(err => console.error("Notification Error:", err));
        }
    } catch (error) {
        console.error("Failed to process comment notifications:", error);
    }

    return comment;
};

const getCommentsByTask = async (taskId) => {
    return await Comment.find({ taskId, deletedAt: null })
        .sort({ createdAt: -1 }) // Newest first
        .populate("userId", "name email avatar");
};

const deleteComment = async (userId, commentId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new NotFoundError("Comment not found");

    // Check ownership
    // Convert to string for comparison
    if (comment.userId.toString() !== userId.toString()) {
        // TODO: Check if user is Admin? For now strict ownership.
        throw new ForbiddenError("You can only delete your own comments");
    }

    // Soft delete
    comment.deletedAt = new Date();
    await comment.save();

    return true;
};

export default {
    createComment,
    getCommentsByTask,
    deleteComment
};
