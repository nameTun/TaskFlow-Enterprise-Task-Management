import { tools } from "../utils/ai-tools.utils.js";
import { getAllTasks, createTask } from "../services/task.service.js";
import { TaskPolicy } from "../policies/task.policy.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";

class AiService {
  constructor() {
    // Sử dụng model Flash để tối ưu tốc độ và Free Tier quota (15 RPM)
    this.modelName = "gemini-2.5-flash";

    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else {
      console.warn("⚠️ GEMINI_API_KEY is missing. AI Service will fail.");
    }
  }

  /**
   * Helper: Chờ một khoảng thời gian (ms)
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getSystemInstruction(user) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString("vi-VN");

    return `You are TaskFlow AI. 
    Current Time: ${dateStr} ${timeStr} (ISO: ${now.toISOString()}).
    User: ${user.name} (Role: ${user.role}).
    Mission: Help manage tasks.
    
    CRITICAL RULE FOR DATES:
    - ALWAYS convert relative dates (e.g., "ngày mai", "cuối tuần", "thứ 6 tuần sau") to exact ISO 8601 format (YYYY-MM-DD) based on Current Time.
    - Example: If today is Monday 2023-10-01 and user says "Friday", use "2023-10-05".
    
    Rules:
    1. Answer briefly in Vietnamese Markdown.
    2. Use tools for actions.`;
  }

  getFunctionCallsFromResponse(response) {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    return parts
      .filter((part) => part.functionCall)
      .map((part) => part.functionCall);
  }

  async executeFunction(name, args, user) {
    console.log(`🤖 Executing Tool: ${name}`);

    try {
      if (name === "getMyTasks") {
        let filter = { deletedAt: null };
        if (args.scope !== "all" || user.role !== "admin") {
          const authFilter = TaskPolicy.getReadFilter(user);
          filter = { ...filter, ...authFilter };
        }
        if (args.status) filter.status = args.status;
        if (args.priority) filter.priority = args.priority;

        const queryOptions = {
          page: 1,
          limit: args.limit || 5,
          sort: "deadline_soon",
          search: args.search,
        };

        const result = await getAllTasks(filter, queryOptions);
        if (result.tasks.length === 0)
          return { message: "Không tìm thấy task." };

        return {
          info: `Found ${result.meta.total} tasks. Top 5:`,
          data: result.tasks.map((t) => ({
            id: t.taskId,
            title: t.title,
            status: t.status,
            priority: t.priority,
            assignee: t.assignedTo?.name,
          })),
        };
      }

      if (name === "createTask") {
        const payload = {
          title: args.title,
          description: args.description || "",
          priority: args.priority || "medium",
          status: "todo",
          visibility: user.teamId ? "team" : "private",
        };
        if (args.dueDate) payload.dueDate = new Date(args.dueDate);
        const newTask = await createTask(user._id, payload);
        return { status: "success", message: `Created task ${newTask.taskId}` };
      }

      if (name === "getSystemStats") {
        if (!["admin", "team_lead"].includes(user.role))
          return { error: "Access Denied" };
        const [u, t, tm] = await Promise.all([
          User.countDocuments({ deletedAt: null }),
          Task.countDocuments({ deletedAt: null }),
          Team.countDocuments({ deletedAt: null }),
        ]);
        return { users: u, tasks: t, teams: tm };
      }

      return { error: "Function not found" };
    } catch (error) {
      console.error("Function Error:", error);
      return { error: error.message };
    }
  }

  /**
   * Hàm gọi Gemini có cơ chế Retry khi gặp lỗi 429
   */
  async sendMessageWithRetry(chatSession, message, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await chatSession.sendMessage(message);
        return result;
      } catch (error) {
        // Chỉ retry nếu lỗi là 429 (Too Many Requests) hoặc 503 (Service Unavailable)
        const isRateLimit =
          error.message?.includes("429") || error.status === 429;
        const isServerBusy =
          error.message?.includes("503") || error.status === 503;

        if ((isRateLimit || isServerBusy) && i < retries - 1) {
          const waitTime = 2000 * (i + 1); // Đợi 2s, 4s, 6s...
          console.warn(
            `⚠️ Rate limit hit. Retrying in ${waitTime / 1000}s... (Attempt ${i + 1
            }/${retries})`
          );
          await this.sleep(waitTime);
          continue; // Thử lại vòng lặp tiếp theo
        }
        throw error; // Nếu lỗi khác hoặc hết lượt retry thì ném lỗi ra ngoài
      }
    }
  }

  async chatWithGemini(message, user) {
    if (!this.genAI) throw new Error("API Key missing");

    try {
      const model = this.genAI.getGenerativeModel(
        {
          model: this.modelName,
          tools: tools,
        },
        { apiVersion: "v1beta" }
      );

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: this.getSystemInstruction(user) }] },
          { role: "model", parts: [{ text: "Ready." }] },
        ],
      });

      console.log(`📤 AI Request: "${message}"`);

      // Dùng hàm Retry thay vì gọi trực tiếp
      let result = await this.sendMessageWithRetry(chat, message);
      let response = result.response;
      let text = response.text();

      // Xử lý Function Calling (Cũng cần retry nếu gọi lại model)
      let functionCalls = this.getFunctionCallsFromResponse(response);
      let loopCount = 0;

      while (functionCalls && functionCalls.length > 0 && loopCount < 3) {
        loopCount++;
        const functionResponses = [];

        for (const call of functionCalls) {
          const apiResult = await this.executeFunction(
            call.name,
            call.args,
            user
          );
          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { result: apiResult },
            },
          });
        }

        // Gửi kết quả function về cho AI (có retry)
        result = await this.sendMessageWithRetry(chat, functionResponses);
        response = result.response;
        text = response.text();
        functionCalls = this.getFunctionCallsFromResponse(response);
      }

      return text;
    } catch (error) {
      console.error("AI Service Final Error:", error.message);

      if (error.message?.includes("429")) {
        return "⏳ AI đang quá tải (Free Tier Limit). Vui lòng đợi 10-15 giây rồi thử lại câu hỏi ngắn hơn.";
      }
      return "Xin lỗi, hệ thống AI đang bảo trì hoặc gặp sự cố kết nối.";
    }
  }
}
const aiService = new AiService();
export default aiService;
