import ActivityLog from "../models/activityLog.model.js";

/**
 * Log an activity to the database.
 * @param {string} actorId - ID of the user performing the action.
 * @param {string} taskId - ID of the task being acted upon.
 * @param {string} action - Action type Enum (e.g. 'CREATE_TASK', 'UPDATE_STATUS').
 * @param {object} content - Snapshot of changes or additional info.
 */
const logActivity = async (actorId, taskId, action, content = {}) => {
    try {
        await ActivityLog.create({
            actorId,
            taskId,
            action,
            content
        });
    } catch (error) {
        console.error("Failed to save activity log:", error);
        // Do not throw error here to avoid blocking the main flow
    }
};

const getLogsByTask = async (taskId) => {
    return await ActivityLog.find({ taskId })
        .sort({ createdAt: -1 })
        .populate("actorId", "name email avatar");
};

export default {
    logActivity,
    getLogsByTask
};
