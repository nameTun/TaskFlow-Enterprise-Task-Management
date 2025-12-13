# ToDo WebApp (Full-Stack JavaScript Edition)

Chào bạn, tôi đã thiết lập nền tảng cho cả **Backend** và **Frontend** của dự án bằng **JavaScript** theo yêu cầu.

## Backend Setup (`/server`)

### 1. Dọn dẹp (Nếu cần)

Nếu bạn đã chạy dự án với TypeScript trước đó, hãy xóa các file không cần thiết:

```bash
# Chỉ chạy lệnh này nếu các file này còn tồn tại
rm server/tsconfig.json server/src/index.ts
```

### 2. Cài đặt và Chạy Backend

Mở một terminal **thứ nhất** và chạy các lệnh sau:

```bash
# 1. Di chuyển vào thư mục server
cd server

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Cấu hình file .env (quan trọng)
#    Mở file .env và điền thông tin MONGO_URI, GOOGLE_CLIENT_ID, etc.

# 4. Khởi chạy server backend
npm run dev
```

Server backend sẽ chạy ở `http://localhost:5000`.

## Frontend Setup (`/client`)

### 1. Cài đặt và Chạy Frontend

Mở một terminal **thứ hai** và chạy các lệnh sau:

```bash
# 1. Di chuyển vào thư mục client
cd client

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy client frontend
npm run dev
```

Trang web frontend sẽ chạy ở `http://localhost:5173` (hoặc một cổng khác do Vite chỉ định).

---

Sau khi bạn thực hiện xong các bước trên và cả hai server đã chạy thành công, hãy báo cho tôi biết. Tôi sẽ bắt đầu xây dựng giao diện và kết nối client với backend.