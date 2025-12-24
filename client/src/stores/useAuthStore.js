import { create } from "zustand";

// Store quản lý trạng thái xác thực
// - accessToken: Chỉ lưu trong Memory (RAM), reload trang sẽ mất -> an toàn XSS.
// - user: Thông tin profile user.
// - isAuthenticated: Trạng thái đăng nhập.
// - isLoading: Trạng thái đang tải (dùng khi check auth lúc reload).

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Mặc định là true để chờ checkAuth

  // Actions
  setAccessToken: (token) => set({ accessToken: token }),

  // Khi login thành công
  loginSuccess: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    }),

  // Khi logout hoặc session hết hạn
  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  // Cập nhật trạng thái loading
  setLoading: (loading) => set({ isLoading: loading }),
}));
