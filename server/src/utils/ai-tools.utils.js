/**
 * Định nghĩa các Function Tool cho Gemini (@google/generative-ai)
 */

const getMyTasksTool = {
  name: "getMyTasks",
  description:
    "Lấy danh sách công việc. Dùng khi user hỏi 'task của tôi', 'công việc hôm nay', 'tìm task'...",
  parameters: {
    type: "OBJECT",
    properties: {
      status: {
        type: "STRING",
        description: "Lọc trạng thái: 'todo', 'in_progress', 'review', 'done'.",
      },
      priority: {
        type: "STRING",
        description: "Lọc ưu tiên: 'low', 'medium', 'high', 'urgent'.",
      },
      search: {
        type: "STRING",
        description: "Từ khóa tìm kiếm (tiêu đề/mô tả).",
      },
      scope: {
        type: "STRING",
        description: "'all' (cho admin tìm hết) hoặc 'mine' (mặc định).",
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
  description:
    "Tạo công việc mới. Dùng khi user nói 'tạo task', 'nhắc tôi làm...', 'thêm công việc'.",
  parameters: {
    type: "OBJECT",
    properties: {
      title: {
        type: "STRING",
        description: "Tiêu đề task (Bắt buộc).",
      },
      description: {
        type: "STRING",
        description: "Mô tả chi tiết.",
      },
      priority: {
        type: "STRING",
        description: "Ưu tiên: 'low', 'medium', 'high'.",
      },
      dueDate: {
        type: "STRING",
        description: "Hạn hoàn thành (ISO 8601 Date String: YYYY-MM-DD).",
      },
    },
    required: ["title"],
  },
};

const getSystemStatsTool = {
  name: "getSystemStats",
  description:
    "Lấy thống kê hệ thống (User, Task, Team). Chỉ dùng cho Admin/Lead.",
  parameters: {
    type: "OBJECT",
    properties: {},
  },
};

// Cấu trúc chuẩn cho @google/generative-ai
const tools = [
  {
    functionDeclarations: [getMyTasksTool, createTaskTool, getSystemStatsTool],
  },
];
export { tools };
//
