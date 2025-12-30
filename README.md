
# 🚀 Enterprise Task Management System

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-MERN-green?style=flat-square)

> **Mô tả:** Hệ thống quản lý công việc chuẩn Doanh nghiệp (Enterprise-grade), được thiết kế tập trung vào **Khả năng mở rộng (Scalability)**, **Bảo mật (Security)** và **Hiệu suất (Performance)**. Dự án áp dụng mô hình kiến trúc phân tầng (Layered Architecture) và các Best Practices trong phát triển Backend với Node.js.

---

## 🌟 Tại sao lại là dự án này? (Motivation)

Không chỉ là một "Todo App" đơn giản, dự án này được xây dựng để giải quyết các bài toán thực tế của Backend Developer:
1.  **Architecture**: Làm thế nào để tổ chức code sạch, dễ bảo trì khi dự án lớn dần? -> *Layered Architecture*.
2.  **Security**: Làm thế nào để xác thực an toàn? -> *JWT Rotation, HttpOnly Cookies, Security Headers*.
3.  **Data Integrity**: Làm sao để quản lý dữ liệu nhất quán? -> *DTOs, Validators, Atomic Operations*.

---

## 🛠️ Tech Stack & Kiến trúc

### Backend (Core Focus)
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB + Mongoose ODM
-   **Architecture Pattern**:
    *   **Controller**: Tiếp nhận request, validate input (DTO), gửi response. Không chứa logic nghiệp vụ.
    *   **Service**: Chứa toàn bộ Business Logic phức tạp.
    *   **Repository/Model**: Tương tác trực tiếp với Database.
-   **Security**:
    *   **Authentication**: JWT (Access Token 15p + Refresh Token 7 ngày). Cơ chế **Rotation** chống replay attack.
    *   **Authorization**: RBAC (Role-Based Access Control) cho Admin, Team Lead, Member.
    *   **Protection**: Helmet (HTTP Headers), MongoSanitize (Chống NoSQL Injection), CORS configurations.
-   **Validation**: Joi (Request Validation).

### Frontend
-   **Core**: React 18 + Vite.
-   **UI Library**: Ant Design 5.0 + TailwindCSS (Hybrid styling).
-   **State Management**: Zustand + Context API.
-   **HTTP Client**: Axios (với Interceptors xử lý Silent Refresh Token).

---

## 🔥 Tính năng chính (Key Features)

### 1. Advanced Authentication & Security
-   Đăng ký/Đăng nhập (Email & Password) với mật khẩu được Hash (Bcrypt).
-   **Google OAuth 2.0** login tích hợp.
-   **Cơ chế Token nâng cao**:
    -   Access Token ngắn hạn.
    -   Refresh Token lưu trong **HttpOnly Cookie** (chống XSS).
    -   Tự động cấp lại token mới khi hết hạn (Silent Refresh).
    -   **Force Logout**: Xóa token khỏi DB để đăng xuất từ xa.

### 2. Task Management (CRUD++)
-   Tạo Task với ID ngắn tự sinh (VD: `TASK-1024`) thay vì ObjectID dài dòng.
-   **Advanced Querying**: Filter, Sort, Pagination phía Server.
-   Full-text Search cho tiêu đề và mô tả.
-   Soft Delete (Khôi phục dữ liệu khi cần).

### 3. Team Collaboration & RBAC
-   Tạo Team và mời thành viên.
-   Phân quyền chi tiết:
    -   **Admin**: Quản lý toàn bộ Users.
    -   **Team Lead**: Quản lý Tasks và Members trong Team.
    -   **Member**: Chỉ thao tác trên Task được giao.

### 4. Audit Logging (Nhật ký hoạt động)
-   Ghi lại mọi thay đổi quan trọng (Ai đã sửa task? Sửa field nào? Vào lúc nào?).
-   Hỗ trợ truy vết lỗi và minh bạch hóa quy trình làm việc.

---

## 📂 Cấu trúc thư mục (Backend)

```bash
server/
├── config/         # Cấu hình DB, Environment
├── controllers/    # Xử lý Request/Response (Skinny Controllers)
├── services/       # Business Logic (Fat Services)
├── models/         # Database Schemas
├── routes/         # API Routes
├── middlewares/    # Auth, Error Handling, Logging
├── dtos/           # Data Transfer Objects (Input filtering)
├── utils/          # Helper functions
└── core/           # Standardized Response/Error Classes
```

---

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu
-   Node.js >= 16
-   MongoDB (Local hoặc Atlas)

### Các bước thực hiện

1.  **Clone dự án**
    ```bash
    git clone https://github.com/yourusername/enterprise-task-management.git
    cd enterprise-task-management
    ```

2.  **Cài đặt dependencies**
    ```bash
    # Cài đặt cho Server
    cd server
    npm install

    # Cài đặt cho Client
    cd ../client
    npm install
    ```

3.  **Cấu hình môi trường (.env)**
    Tạo file `server/.env` dựa trên `server/.env.example` (Cần cấu hình MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID).

4.  **Chạy dự án**
    ```bash
    # Terminal 1: Chạy Server (Port 5000)
    cd server
    npm run dev

    # Terminal 2: Chạy Client (Port 5173)
    cd client
    npm run dev
    ```

---

## 📬 Liên hệ

Dự án được thực hiện bởi Phan Đình Tuân
-   Email: tuanktvn2001@gmail.com
-   Github: 
-   LinkedIn: 

---
đã tạo feature/team-collaboration, tôi cần viết commit cho giai đoạn 3 này và phần mô ta chi tiết trong commit 