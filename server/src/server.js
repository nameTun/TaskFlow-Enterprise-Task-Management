
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/error.middleware.js";

// Load environment variables từ file .env
dotenv.config({ path: ".env" });

const app = express();

// Kết nối đến MongoDB
connectDB();

// --- Middlewares ---
// Cấu hình Helmet để thiết lập các HTTP headers liên quan đến bảo mật
app.use(helmet());

// Trong môi trường phát triển, client (Vite) chạy trên cổng 5173
const clientURL = process.env.CLIENT_URL || "http://localhost:5173";

// Cấu hình CORS để cho phép các yêu cầu từ clientURL
app.use(
  cors({
    origin: clientURL,
    credentials: true, // Cho phép gửi cookies qua các yêu cầu cross-origin
  })
);

// Middleware để phân tích JSON payloads trong các yêu cầu
app.use(express.json());
// Middleware để phân tích URL-encoded payloads trong các yêu cầu
app.use(express.urlencoded({ extended: true }));
// Middleware để phân tích cookie từ header của yêu cầu
app.use(cookieParser());

// Giới hạn tốc độ yêu cầu để ngăn chặn các cuộc tấn công brute-force
// Giới hạn mỗi IP 100 yêu cầu mỗi 15 phút.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // giới hạn mỗi IP 100 yêu cầu trong khoảng thời gian windowMs
  standardHeaders: true, // Trả về thông tin giới hạn tốc độ trong các header `RateLimit-*`
  legacyHeaders: false, // Tắt các header `X-RateLimit-*` cũ
});
app.use(limiter);

// --- Routes ---
import indexRouter from "./routes/index.routes.js";

app.use("/api", indexRouter); // Sử dụng các route chính
// Định tuyến cơ bản cho trang chủ
app.get("/", (req, res) => {
  res.send("API Xác thực & Phân quyền");
});

// --- Xử lý lỗi ---
// Middleware xử lý lỗi tập trung
app.use(errorHandler);


export default app;
