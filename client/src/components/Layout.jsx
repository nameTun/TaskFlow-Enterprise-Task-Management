import React, { useState } from "react";
import { Layout, theme } from "antd";
import Sidebar from "./Sidebar";
import HeaderComponent from "./Header";
import { useTheme } from "../context/Theme/Theme.context"; // Import useTheme

const { Content } = Layout;

const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = useTheme(); // Lấy darkMode trực tiếp từ Context nếu cần style inline

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: darkMode ? "#141414" : "#fff",
            borderRadius: "8px",
            overflowY: "auto",
          }}
          className="shadow-sm"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;
