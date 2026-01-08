import React, { createContext, useContext, useEffect, useRef } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../stores/useAuthStore";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  // Lấy state và actions từ Zustand Store
  const {
    user,
    isAuthenticated,
    isLoading,
    loginSuccess,
    logout: logoutAction,
    setLoading,
  } = useAuthStore();

  // Dùng useRef để chặn việc gọi API 2 lần trong React Strict Mode (Dev environment)
  // Strict Mode sẽ mount component 2 lần, gây ra 2 request refresh token song song.
  // Request 1 đổi token A -> B (DB update thành B).
  // Request 2 vẫn cầm token A -> Gửi lên -> Server check DB thấy B -> Báo lỗi A không tồn tại -> Logout.
  const isCheckedRef = useRef(false);

  // Logic khởi tạo (Hydration): Chạy 1 lần khi App mount (F5)
  useEffect(() => {
    // Nếu đã check rồi thì bỏ qua (Ngăn chặn lần chạy thứ 2 của Strict Mode)
    if (isCheckedRef.current) {
      return;
    }
    isCheckedRef.current = true;

    const initializeAuth = async () => {
      try {
        // Ta gọi /auth/refresh-token. API này sử dụng HttpOnly Cookie (bền vững khi F5).
        // Nếu Cookie còn hạn -> Server trả về User + Access Token mới -> Restore Session thành công.
        const response = await api.post("/auth/refresh-token");

        if (response && response.data && response.data.metadata) {
          const { user, tokens } = response.data.metadata;
          // Lưu Access Token mới và User Info vào Zustand Store
          loginSuccess(user, tokens.accessToken);
        } else {
          // Nếu response không đúng định dạng mong đợi
          logoutAction();
        }
      } catch (error) {
        // Lỗi này thường do Cookie hết hạn hoặc không tồn tại
        // Không cần log lỗi quá to tát, chỉ đơn giản là coi như user chưa login
        // console.log("Session restore failed (No valid cookie):", error.message);
        logoutAction();
      } finally {
        // Luôn tắt trạng thái loading để App render nội dung
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array -> Chỉ chạy 1 lần logic bên trong (nhờ check ref)

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      // console.log("response from login:", response);
      if (!response || !response.data || !response.data.metadata) {
        throw new Error(response?.data?.message || "Lỗi phản hồi từ máy chủ");
      }
      const { user, tokens } = response.data.metadata;

      loginSuccess(user, tokens.accessToken);
      return user;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Đăng nhập thất bại";
      throw new Error(message);
    }
  };

  // --- REGISTER ---
  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("response register:", response);

      if (!response || !response.data || !response.data.metadata) {
        throw new Error(response?.data?.message || "Lỗi phản hồi từ máy chủ");
      }
      const { user, tokens } = response.data.metadata;
      loginSuccess(user, tokens.accessToken);
      return user;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
      throw new Error(message);
    }
  };

  // --- GOOGLE LOGIN ---
  const loginWithGoogle = async (credential) => {
    try {
      // Gửi token của Google xuống backend để xác thực và lấy session hệ thống
      const response = await api.post("/auth/google", { credential });
      const { user, tokens } = response.data.metadata;

      loginSuccess(user, tokens.accessToken);
      return user;
    } catch (error) {
      console.error("Google Login Error:", error);
      const message =
        error.response?.data?.message || "Đăng nhập Google thất bại";
      throw new Error(message);
    }
  };
  1
  // --- LOGOUT ---
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error (server side):", error);
    } finally {
      logoutAction();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
