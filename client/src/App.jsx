import React from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ConfigProvider, theme, Spin } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { AuthProvider, useAuth } from "./context/Auth/Auth.context";
import { ThemeProvider, useTheme } from "./context/Theme/Theme.context";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import TaskDetail from "./pages/TaskDetail";
import LayoutComponent from "./components/Layout";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation(); // Lấy vị trí hiện tại

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spin size="large" tip="Authenticating..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu location hiện tại vào state để Login xong có thể redirect lại
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

// Component con để kết nối ThemeContext với Antd ConfigProvider
const AppContent = () => {
  const { darkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: "Inter, sans-serif",
          colorPrimary: "#1677ff",
          borderRadius: 6,
        },
      }}
    >
      <StyleProvider layer>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <LayoutComponent>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/tasks" element={<Dashboard />} />
                      <Route path="/tasks/:id" element={<TaskDetail />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </LayoutComponent>
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </StyleProvider>
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
