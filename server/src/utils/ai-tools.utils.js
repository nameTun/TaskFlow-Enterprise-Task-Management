/**
 * Định nghĩa các Function Tool cho Gemini (@google/generative-ai)
 */

const getMyTasksTool = {
  name: "getMyTasks",
  description:
    "Công cụ tìm kiếm và lấy danh sách công việc (tasks). Dùng cho mọi câu hỏi liên quan đến liệt kê công việc.",
  parameters: {
    type: "OBJECT",
    properties: {
      status: {
        type: "STRING",
        description:
          "Lọc theo trạng thái: 'todo', 'in_progress', 'review', 'done'.",
      },
      priority: {
        type: "STRING",
        description: "Lọc theo độ ưu tiên: 'low', 'medium', 'high', 'urgent'.",
      },
      search: {
        type: "STRING",
        description:
          "Từ khóa tìm kiếm trong tiêu đề hoặc mô tả (Ví dụ: 'hợp đồng', 'bug login', 'báo cáo').",
      },
      scope: {
        type: "STRING",
        description:
          "Phạm vi: 'all' (nếu admin muốn tìm toàn hệ thống), 'mine' (mặc định).",
      },
      limit: {
        type: "NUMBER",
        description: "Số lượng tối đa (mặc định 5).",
      },
    },
  },
};

const createTaskTool = {
  name: "createTask",
  description: "Tạo một công việc (task) mới.",
  parameters: {
    type: "OBJECT",
    properties: {
      title: {
        type: "STRING",
        description: "Tiêu đề task.",
      },
      description: {
        type: "STRING",
        description: "Mô tả chi tiết.",
      },
      priority: {
        type: "STRING",
        description: "Mức độ ưu tiên: 'low', 'medium', 'high'.",
      },
      dueDate: {
        type: "STRING",
        description: "Hạn hoàn thành (YYYY-MM-DD).",
      },
    },
    required: ["title"],
  },
};

const getSystemStatsTool = {
  name: "getSystemStats",
  description: "Lấy thống kê số lượng User, Task, Team trong hệ thống.",
  parameters: {
    type: "OBJECT",
    properties: {},
  },
};
export const tools = [getMyTasksTool, createTaskTool, getSystemStatsTool];
//
