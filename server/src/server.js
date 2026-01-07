
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/error.middleware.js";
import indexRouter from "./routes/index.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger/swagger.js";

// Load environment variables từ file .env
dotenv.config({ path: ".env" });

const app = express();

// Kết nối đến MongoDB
connectDB();

// --- Middlewares ---
// Cấu hình Helmet để thiết lập các HTTP headers liên quan đến bảo mật
// Tùy chỉnh CSP để cho phép Swagger UI hoạt động
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         connectSrc: ["'self'", `http://localhost:${process.env.PORT || 3000}`],
//         scriptSrc: ["'self'", "'unsafe-inline'"], // Cho phép script inline từ Swagger UI
//         styleSrc: ["'self'", "'unsafe-inline'"], // Cho phép style inline từ Swagger UI
//         imgSrc: ["'self'", "data:"], // Cho phép ảnh từ data URIs
//       },
//     },
//   })
// );
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Swagger UI sử dụng inline script và style -> cần 'unsafe-inline'
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        // Cho phép load ảnh từ mọi nguồn (avatar user) và data: (swagger logo)
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        // QUAN TRỌNG: Cho phép Swagger fetch data từ localhost và 127.0.0.1
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "https://accounts.google.com",
        ],
        frameSrc: ["'self'", "https://accounts.google.com"], // Cho Google Auth iframe
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null, // Tắt tự động chuyển HTTP sang HTTPS ở localhost
      },
    },
    crossOriginEmbedderPolicy: false, // Tắt COEP để tránh chặn resource chéo
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Cho phép resource load chéo
  })
);
// Trong môi trường phát triển, client (Vite) chạy trên cổng 5173 và API docs cũng cần truy cập
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  `http://localhost:${process.env.PORT || 3000}`,
];

// Cấu hình CORS để cho phép các yêu cầu từ các origin trong danh sách
app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép các request không có origin (ví dụ: mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
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

// --- Documentation (Swagger) ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// --- Routes ---
app.use("/api", indexRouter); // Sử dụng các route chính

// Định tuyến cơ bản cho trang chủ
app.get("/", (req, res) => {
  res.send("API Xác thực & Phân quyền");
});

// --- Xử lý lỗi ---
// Middleware xử lý lỗi tập trung bắt các lỗi do asyncHandler trả về
app.use(errorHandler);


export default app;
