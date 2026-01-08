/**
 * Định nghĩa các Function Tool cho Gemini (@google/generative-ai)
 */

const getMyTasksTool = {
  name: "getMyTasks",
  description:
    "Tìm kiếm và lấy danh sách công việc (Tasks). SỬ DỤNG KHI: User hỏi về 'task của tôi', 'việc cần làm', 'tiến độ', 'deadline', hoặc tìm task theo trạng thái/ưu tiên. VÍ DỤ: 'Tìm task chưa xong', 'Task nào quan trọng cao?', 'Việc hôm nay'.",
  parameters: {
    type: "OBJECT",
    properties: {
      status: {
        type: "STRING",
        description: "Lọc theo trạng thái. GIÁ TRỊ: 'todo' (Cần làm), 'in_progress' (Đang làm), 'review' (Đang duyệt), 'done' (Hoàn thành).",
      },
      priority: {
        type: "STRING",
        description: "Lọc theo mức độ ưu tiên. GIÁ TRỊ: 'low' (Thấp), 'medium' (Vừa), 'high' (Cao), 'urgent' (Khẩn cấp).",
      },
      search: {
        type: "STRING",
        description: "Từ khóa tìm kiếm trong Tiêu đề hoặc Mô tả. Ví dụ: 'họp', 'baocao', 'frontend'.",
      },
      scope: {
        type: "STRING",
        description: "Phạm vi tìm kiếm. GIÁ TRỊ: 'mine' (Của tôi - mặc định), 'all' (Tất cả - chỉ cho Admin xem toàn bộ hệ thống).",
      },
      limit: {
        type: "NUMBER",
        description: "Số lượng kết quả tối đa trả về. Mặc định là 5. Nếu user hỏi 'tất cả' hoặc 'danh sách', hãy tăng lên 10 hoặc 20.",
      },
    },
  },
};

const createTaskTool = {
  name: "createTask",
  description:
    "Tạo một công việc (Task) mới vào hệ thống. SỬ DỤNG KHI: User muốn giao việc, nhắc nhở, tạo ghi chú công việc. VÍ DỤ: 'Tạo task đi gặp khách hàng', 'Nhắc tôi nộp báo cáo chiều nay', 'Thêm công việc fix bug'.",
  parameters: {
    type: "OBJECT",
    properties: {
      title: {
        type: "STRING",
        description: "Tên công việc ngắn gọn. Trích xuất từ câu nói của user. Ví dụ: 'Gửi email cho sếp'.",
      },
      description: {
        type: "STRING",
        description: "Mô tả chi tiết hơn nếu có. Nếu không có, để chuỗi rỗng.",
      },
      priority: {
        type: "STRING",
        description: "Mức độ ưu tiên. Suy luận từ câu nói. GIÁ TRỊ: 'low', 'medium' (mặc định), 'high'. Nếu user nói 'gấp', 'quan trọng' -> set 'high'.",
      },
      dueDate: {
        type: "STRING",
        description: "Thời hạn hoàn thành. ĐỊNH DẠNG: ISO 8601 'YYYY-MM-DD'. AI tự suy luận từ 'hôm nay', 'mai', 'thứ 6 tuần sau'. Nếu không rõ, để null.",
      },
    },
    required: ["title"],
  },
};

const getSystemStatsTool = {
  name: "getSystemStats",
  description:
    "Xem báo cáo thống kê tổng quan về hệ thống. SỬ DỤNG KHI: User hỏi 'Tổng quan hệ thống', 'Có bao nhiêu user?', 'Thống kê task', 'Báo cáo'. CHỈ DÀNH CHO ADMIN.",
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
