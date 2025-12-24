import React, { createContext, useContext, useEffect } from "react";
// Lưu ý: Cập nhật đường dẫn import do thay đổi cấu trúc thư mục (thêm 1 cấp folder)
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

  // --- CHECK AUTH ON MOUNT (F5) ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        const currentToken = useAuthStore.getState().accessToken;

        if (response.data.metadata) {
          loginSuccess(response.data.metadata, currentToken);
        }
      } catch (error) {
        console.log("Phiên đăng nhập không tồn tại hoặc đã hết hạn.");
        logoutAction();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("response from login:", response);

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
      const { user, tokens } = response.metadata;

      loginSuccess(user, tokens.accessToken);
      return user;
    } catch (error) {
      console.error("Google Login Error:", error);
      const message =
        error.response?.data?.message || "Đăng nhập Google thất bại";
      throw new Error(message);
    }
  };

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
