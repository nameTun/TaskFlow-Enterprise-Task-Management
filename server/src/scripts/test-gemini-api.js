
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
  console.log("🔍 Đang kiểm tra Gemini API Key...");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ LỖI: Không tìm thấy API_KEY trong file .env");
    return;
  }

  console.log(
    `🔑 Key đang dùng: ${apiKey.substring(0, 5)}...${apiKey.substring(
      apiKey.length - 4
    )}`
  );

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Sử dụng model chuẩn nhất hiện nay
    // Lưu ý: apiVersion 'v1beta' quan trọng cho các model 1.5
    const model = genAI.getGenerativeModel(
      { model: "gemini-2.5-flash" },
    //   { apiVersion: "v1beta" }
    );

    console.log("📡 Đang gửi request test tới Google...");
    const result = await model.generateContent(
      "Chào bạn, hãy trả lời 'OK' nếu bạn nhận được tin nhắn này."
    );
    const response = await result.response;
    const text = response.text();

    console.log("KẾT NỐI THÀNH CÔNG!");
    console.log("Phản hồi từ AI:", text);
    console.log("------------------------------------------------");
  } catch (error) {
    console.error("KẾT NỐI THẤT BẠI:");
    console.error("---------------------");
    if (error.message.includes("403") || error.message.includes("API key")) {
      console.error(
        "NGUYÊN NHÂN: API Key không hợp lệ hoặc tài khoản Google Cloud chưa bật billing (nếu dùng bản trả phí)."
      );
    } else if (error.message.includes("404")) {
      console.error(
        "NGUYÊN NHÂN: Tên Model không đúng hoặc phiên bản API không hỗ trợ model này."
      );
    } else {
      console.error("NGUYÊN NHÂN:", error.message);
    }
    console.log("------------------------------------------------");
  }
}

testConnection();
