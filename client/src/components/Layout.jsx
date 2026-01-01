import React, { useState } from "react";
import { Layout, Drawer, theme } from "antd";
import Sidebar from "./Sidebar";
import HeaderComponent from "./Header";
import { useTheme } from "../context/Theme/Theme.context";
import ChatWidget from "./AIChat/ChatWidget";


const { Content, Sider } = Layout;

const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { darkMode } = useTheme();

  return (
    // QUAN TRỌNG: hasSider giúp Layout biết cấu trúc có thanh bên, xếp layout theo chiều ngang
    <Layout style={{ minHeight: "100vh" }} hasSider>
      {/* Desktop Sidebar - Hidden on small screens */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="hidden md:block border-r border-gray-200 dark:border-gray-800 !bg-white dark:!bg-[#141414]"
        width={240}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      {/* Mobile Sidebar (Drawer) */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        styles={{ body: { padding: 0 } }}
        width={250}
        closable={false}
      >
        <div className="h-full bg-white dark:bg-[#141414]">
          <Sidebar
            collapsed={false}
            isMobile={true}
            closeDrawer={() => setMobileDrawerOpen(false)}
          />
        </div>
      </Drawer>

      <Layout
        style={{ marginLeft: collapsed ? 80 : 240, transition: "all 0.2s" }}
        className="md:ml-[240px] ml-0"
      >
        <HeaderComponent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileDrawerOpen={mobileDrawerOpen}
          setMobileDrawerOpen={setMobileDrawerOpen}
        />
        <Content
          style={{
            margin: "16px",
            padding: 24,
            minHeight: 280,
            background: darkMode ? "#141414" : "#fff",
            borderRadius: "12px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
          className="shadow-sm"
        >
          {children}
        </Content>
      </Layout>
      {/* Tích hợp AI Chat Widget vào toàn bộ ứng dụng */}
      <ChatWidget />
    </Layout>
  );
};

export default LayoutComponent;
