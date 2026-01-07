import axios from "axios";
// Store này sẽ giữ access token trong bộ nhớ JavaScript, không dùng localStorage.
import { useAuthStore } from "../stores/useAuthStore";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- CẤU HÌNH AXIOS INSTANCE ---
// Tạo một instance của Axios để có thể cấu hình tập trung cho tất cả các API call.
const api = axios.create({
  // Đặt URL gốc cho tất cả các request.
  // Sử dụng biến môi trường để dễ dàng chuyển đổi giữa môi trường dev và production.
  // Ví dụ: 'http://localhost:3000/api' cho Express server ở local

  // baseURL: process.env.NODE_ENV === "development" ? API_BASE_URL : "/api",
  baseURL: "/api",

  // `withCredentials: true` là cấu hình CỰC KỲ QUAN TRỌNG.
  // Nó cho phép Axios (và trình duyệt) tự động gửi và nhận cookies
  // qua các request đến domain khác (cross-origin).
  // Điều này là BẮT BUỘC để trình duyệt có thể gửi httpOnly cookie chứa refresh token.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTOR (BỘ CHẶN YÊU CẦU) ---
// Interceptor này sẽ được thực thi TRƯỚC KHI mỗi request được gửi đi.
// Nhiệm vụ chính của nó là đính kèm access token vào header.
api.interceptors.request.use(
  (config) => {
    // Lấy access token từ state management store (bộ nhớ ứng dụng).
    const token = useAuthStore.getState().accessToken;

    // Nếu có token trong state, gắn nó vào header 'Authorization'.
    // Định dạng 'Bearer <token>' là một tiêu chuẩn phổ biến.
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config; // Trả về config đã được sửa đổi để request được tiếp tục.
  },
  (error) => {
    // Xử lý lỗi nếu có sự cố xảy ra trong quá trình thiết lập request.
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR (BỘ CHẶN PHẢN HỒI) ---
// Interceptor này được thực thi SAU KHI nhận được response từ server.
// Nó cho phép xử lý response và lỗi một cách tập trung.
api.interceptors.response.use(
  // 1. Hàm cho các response thành công (HTTP status 2xx)
  (response) => {
    // Không làm gì cả, chỉ cần trả về response để code ở nơi gọi API có thể xử lý.
    // Bạn cũng có thể trả về `response.data` nếu chỉ muốn lấy dữ liệu.
    return response;
  },

  // 2. Hàm cho các response lỗi (HTTP status không phải 2xx)
  async (error) => {
    // `error.config` chứa toàn bộ cấu hình của request đã gây ra lỗi.
    const originalRequest = error.config;

    // --- LOGIC LÀM MỚI TOKEN TỰ ĐỘNG ---
    // Chỉ xử lý khi lỗi là 401 Unauthorized và request này chưa được thử lại.
    // Lỗi 401 thường có nghĩa là access token đã hết hạn.
    // `_retry` là một thuộc tính tùy chỉnh ta tự thêm vào để tránh vòng lặp vô tận
    // trong trường hợp API làm mới token cũng trả về 401.
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại 1 lần.

      try {
        // Bắt đầu quá trình làm mới token.
        console.log("Access token expired. Attempting to refresh...");

        // Gọi API đến endpoint '/auth/refresh'.
        // Vì đã có `withCredentials: true`, trình duyệt sẽ tự động đính kèm
        // httpOnly cookie (chứa refresh token) vào request này.
        // Server sẽ dùng refresh token đó để tạo ra access token mới.
        const { data } = await api.post("/auth/refresh-token");

        // Lấy access token mới từ response của server.
        const newAccessToken = data.accessToken;
        console.log("Token refreshed successfully.");

        // Cập nhật access token mới vào state management store.
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Cập nhật header của request *ban đầu* đã thất bại với token mới.
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Gọi lại request ban đầu với cấu hình đã được cập nhật.
        // `api(originalRequest)` sẽ thực hiện lại request (ví dụ: GET /users/me)
        // một cách liền mạch mà người dùng không hề hay biết.
        return api(originalRequest);
      } catch (refreshError) {
        // --- XỬ LÝ KHI LÀM MỚI TOKEN THẤT BẠI ---
        // Nếu việc làm mới token thất bại (ví dụ: refresh token cũng hết hạn hoặc không hợp lệ),
        // server sẽ trả về lỗi.
        console.error("Unable to refresh token:", refreshError);

        // Xóa trạng thái xác thực khỏi store (đăng xuất người dùng).
        useAuthStore.getState().clearState();

        // Chuyển hướng người dùng về trang đăng nhập.

        window.location.href = '/login';

        // Trả về lỗi để nơi gọi API ban đầu có thể bắt được (nếu cần).
        return Promise.reject(refreshError);
      }
    }

    // Đối với tất cả các lỗi khác (không phải 401), chỉ cần trả về lỗi đó.
    return Promise.reject(error);
  }
);

export default api;
