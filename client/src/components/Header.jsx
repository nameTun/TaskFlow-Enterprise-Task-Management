import React from "react";
import { Layout, Button, Avatar, Badge, theme } from "antd";
import { Menu as MenuIcon, Moon, Sun, Bell, HelpCircle } from "lucide-react";
import { useAuth } from "../context/Auth/Auth.context";
import { useTheme } from "../context/Theme/Theme.context";

const { Header } = Layout;

const HeaderComponent = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Header
      style={{ padding: "0 16px", background: colorBgContainer }}
      className="flex items-center justify-between sticky top-0 z-10 shadow-sm"
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={<MenuIcon size={20} />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: 46, height: 46 }}
        />
        <h2 className="ml-4 text-lg font-semibold text-gray-800 dark:text-white hidden md:block">
          Overview
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="text"
          shape="circle"
          icon={darkMode ? <Sun size={20} /> : <Moon size={20} />}
          onClick={toggleTheme}
        />

        <Badge dot>
          <Button type="text" shape="circle" icon={<Bell size={20} />} />
        </Badge>

        <Button type="text" shape="circle" icon={<HelpCircle size={20} />} />

        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
          <Avatar src={user?.avatar} style={{ backgroundColor: "#1677ff" }}>
            {user?.fullName?.[0] || "U"}
          </Avatar>
          <div className="hidden md:block leading-tight">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.fullName}
            </div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default HeaderComponent;
