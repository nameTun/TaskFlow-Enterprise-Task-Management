// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';
// import connectDB from './config/db.js';
// import passport from './config/passport.js'; // Import passport

// // Load environment variables từ file .env
// dotenv.config({ path: '.env' });

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Kết nối đến MongoDB
// connectDB();

// // --- Middlewares ---
// // Cấu hình Helmet để thiết lập các HTTP headers liên quan đến bảo mật
// app.use(helmet());

// // Trong môi trường phát triển, client (Vite) chạy trên cổng 5173
// const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';

// // Cấu hình CORS để cho phép các yêu cầu từ clientURL
// app.use(cors({
//   origin: clientURL,
//   credentials: true, // Cho phép gửi cookies qua các yêu cầu cross-origin
// }));

// // Middleware để phân tích JSON payloads trong các yêu cầu
// app.use(express.json());
// // Middleware để phân tích URL-encoded payloads trong các yêu cầu
// app.use(express.urlencoded({ extended: true }));
// // Middleware để phân tích cookie từ header của yêu cầu
// app.use(cookieParser());

// // --- Passport Middleware ---
// // Khởi tạo Passport để sử dụng trong xác thực
// app.use(passport.initialize());

// // --- Routes ---
// import authRoutes from './routes/auth.routes.js';
// import todoRoutes from './routes/todo.routes.js';

// // Định tuyến cơ bản cho trang chủ
// app.get('/', (req, res) => {
//   res.send('<h1>Todo App Backend API</h1>');
// });

// // Các tuyến API cho xác thực người dùng
// app.use('/api/auth', authRoutes);
// // Các tuyến API cho quản lý công việc (todos)
// app.use('/api/todos', todoRoutes);

// // --- Xử lý lỗi ---
// // Middleware xử lý lỗi tập trung
// app.use((err, req, res, next) => {
//     console.error(err.stack); // Ghi log lỗi ra console
//     res.status(500).send('Có lỗi xảy ra trên máy chủ!'); // Gửi phản hồi lỗi 500 cho client
// });

// // --- Khởi động máy chủ ---
// // Lắng nghe các yêu cầu trên cổng đã định
// app.listen(PORT, () => {
//   console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
// });

// export default app;

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import passport from "./config/passport.js"; 

// Load environment variables từ file .env
dotenv.config({ path: ".env" });

const app = express();
const PORT = process.env.PORT || 5000;

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

// --- Passport Middleware ---
// Khởi tạo Passport để sử dụng trong xác thực
app.use(passport.initialize());

// --- Routes ---
import authRoutes from "./routes/auth.routes.js";
import todoRoutes from "./routes/todo.routes.js";

// Định tuyến cơ bản cho trang chủ
app.get("/", (req, res) => {
  res.send("<h1>Todo App Backend API</h1>");
});

// Các tuyến API cho xác thực người dùng
app.use("/api/auth", authRoutes);
// Các tuyến API cho quản lý công việc (todos)
app.use("/api/todos", todoRoutes);

// --- Xử lý lỗi ---
// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error(err.stack); // Ghi log lỗi ra console
  res.status(500).send("Có lỗi xảy ra trên máy chủ!"); // Gửi phản hồi lỗi 500 cho client
});

app.use((error, req, res, next) => {
  // Nếu lỗi có status thì lấy, không thì mặc định 500
  const statusCode = error.status || 500;

  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
    // Chỉ hiện stack trace (dòng lỗi) khi đang Dev để debug
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});
// --- Khởi động máy chủ ---
// Lắng nghe các yêu cầu trên cổng đã định
app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
});

export default app;
