import Notification from "../models/notification.model.js";

/**
 * Tạo thông báo mới
 * @param {Object} data
 * @param {string} data.recipientId
 * @param {string} data.senderId
 * @param {string} data.type
 * @param {string} data.title
 * @param {string} data.message
 * @param {Object} data.payload
 */
const createNotification = async ({
    recipientId,
    senderId,
    type,
    title,
    message,
    payload = {},
}) => {
    try {
        const newNotification = await Notification.create({
            recipientId,
            senderId,
            type,
            title,
            message,
            payload,
        });
        return newNotification;
    } catch (error) {
        console.error("Create notification failed:", error);
        // Không throw error để tránh chặn luồng chính
    }
};

export default {
    createNotification,
};
