import Task from "../models/task.model.js";
import Notification from "../models/notification.model.js";

/**
 * Kiểm tra các task sắp hết hạn của user và tạo thông báo nếu chưa có.
 * Chiến thuật: Check on Login (Lazy Check)
 * @param {string} userId
 */
export const checkDeadlineAndNotify = async (userId) => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Tìm các task chưa xong (status != done) VÀ sắp hết hạn (<= ngày mai)
        // Lưu ý: Cần xử lý múi giờ cẩn thận nếu production, ở đây làm đơn giản trước.
        const deadlineTasks = await Task.find({
            assignedTo: userId,
            status: { $ne: "done" },
            dueDate: {
                $lte: tomorrow, // Hết hạn hôm nay hoặc mai
                $gte: new Date(today.setHours(0, 0, 0, 0)), // Bỏ qua task quá cũ (tùy chọn)
                // Hoặc nếu muốn báo cả Overdue thì bỏ $gte
            },
            deletedAt: null,
        });

        if (deadlineTasks.length === 0) return;

        // 2. Với mỗi task tìm được, check xem đã thông báo chưa
        // Để tránh spam mỗi lần login, ta check trong bảng Notification
        // xem đã có noti loại 'DEADLINE' cho task này trong hôm nay chưa.

        for (const task of deadlineTasks) {
            // Check xem đã có noti nào cho task này chưa
            const existingNoti = await Notification.findOne({
                recipientId: userId,
                redirectUrl: `/tasks/${task._id}`, // Dùng link làm key định danh
                type: 'DEADLINE',
                // Có thể thêm điều kiện createdAt > đầu ngày để nhắc lại mỗi ngày 1 lần
            });

            if (!existingNoti) {
                let message = `Nhắc nhở: Task "${task.title}" sắp đến hạn!`;
                if (new Date(task.dueDate) < new Date()) {
                    message = `Cảnh báo: Task "${task.title}" đã quá hạn!`;
                }

                await Notification.create({
                    recipientId: userId,
                    senderId: null, // System notification
                    type: 'DEADLINE',
                    title: 'Việc cần làm gấp',
                    message: message,
                    redirectUrl: `/tasks/${task._id}`,
                    isRead: false
                });
                console.log(`🔔 Created deadline notification for user ${userId} - Task ${task.title}`);
            }
        }

    } catch (error) {
        console.error("Error in checkDeadlineAndNotify:", error);
        // Không throw lỗi để tránh chặn luồng Login chính
    }
};
