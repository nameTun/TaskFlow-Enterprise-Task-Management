
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
/**
 * CHECK GEMINI_API_KEY SCRIPT
 * Lệnh Terminal/server: node src/scripts/test-gemini-api.js
 * Mục đích: kiểm tra gemini key có đúng không
 */

async function testConnection() {
  console.log("------------------------------------------------");
  console.log(" Đang kiểm tra Gemini API Key (@google/generative-ai)...");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("LỖI: Không tìm thấy API_KEY trong file .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Thử model mới nhất mà bạn xác nhận hoạt động (Gemini 2.0 Flash Exp)
  // và một vài biến thể khác phòng hờ.
  const modelsToTry = ["gemini-2.5-flash"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Đang thử model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Chào bạn, bạn là ai?");
      const response = await result.response;
      const text = response.text();

      console.log(`KẾT NỐI THÀNH CÔNG VỚI: ${modelName}`);
      console.log("Phản hồi:", text);
      console.log("------------------------------------------------");

      console.log(
        `Đã cập nhật file 'server/services/ai.service.js' sử dụng: '${modelName}'`
      );
      return; // Thoát nếu thành công
    } catch (error) {
      console.log(
        `Thất bại với ${modelName}: ${error.message.split("]")[0]}]`
      );
    }
  }

  console.log("------------------------------------------------");
}

testConnection();