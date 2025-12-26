import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Store quản lý trạng thái xác thực
// - accessToken: Được lưu vào localStorage để duy trì trạng thái đăng nhập khi reload.
// - user: Thông tin profile user.
// - isAuthenticated: Trạng thái đăng nhập.
// - isLoading: Trạng thái đang tải (dùng khi check auth lúc reload).

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true, // Giữ nguyên là true để chờ checkAuth khi tải lại trang

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
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage), // Chỉ định sử dụng localStorage
      // Chỉ lưu `accessToken` vào localStorage
      partialize: (state) => ({ accessToken: state.accessToken }),
      // Hàm này sẽ được gọi khi state được khôi phục từ localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Cập nhật trạng thái isAuthenticated dựa trên sự tồn tại của accessToken
          state.isAuthenticated = !!state.accessToken;
        }
      },
    }
  )
);
