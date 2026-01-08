import Notification from "../models/notification.model.js";
import Task from "../models/task.model.js";

/**
 * Checks for tasks due today or tomorrow and creates notifications.
 * Should be called lazily (e.g., on user login).
 * @param {string} userId
 */
export const checkDeadlineAndNotify = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // 1. Tìm các task có dueDate trong ngày hôm nay hoặc ngày mai
        //    và chưa hoàn thành (status != 'done')
        const tasksDueSoon = await Task.find({
            assignedTo: userId,
            status: { $ne: "done" },
            dueDate: {
                $gte: today,
                $lt: dayAfterTomorrow,
            },
        }).select("title dueDate");

        if (!tasksDueSoon.length) return;

        // 2. Với mỗi task, kiểm tra xem đã có noti chưa
        //    Để tránh spam, ta có thể check theo logic: 
        //    "Nếu đã có noti DEADLINE_SOON cho task này TRONG NGÀY HÔM NAY thì thôi"

        const notificationsToInsert = [];

        for (const task of tasksDueSoon) {
            // Check duplicate noti for this task
            const existingNoti = await Notification.findOne({
                recipientId: userId,
                type: "DEADLINE_SOON",
                relatedTaskId: task._id,
                isRead: false, // Nếu chưa đọc thì không cần báo lại
            });

            if (!existingNoti) {
                // Tạo notification object
                const dueText =
                    task.dueDate < tomorrow ? "hôm nay" : "ngày mai";

                notificationsToInsert.push({
                    recipientId: userId,
                    type: "DEADLINE_SOON",
                    title: "Nhắc nhở hạn chót",
                    message: `Công việc "${task.title}" sẽ hết hạn vào ${dueText}.`,
                    relatedTaskId: task._id,
                });
            }
        }

        if (notificationsToInsert.length > 0) {
            await Notification.insertMany(notificationsToInsert);
            console.log(`[Notification] Created ${notificationsToInsert.length} deadline alerts for user ${userId}`);
        }

    } catch (error) {
        console.error("[NotificationHelper] Error checking deadlines:", error);
        // Không throw error để tránh chặn luồng Login
    }
};
