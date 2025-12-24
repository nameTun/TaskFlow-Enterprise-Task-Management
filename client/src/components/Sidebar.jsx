import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth/Auth.context";
import { UserRole } from "../constants/constant";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    {
      key: "/tasks",
      icon: <CheckSquare size={20} />,
      label: "Tasks",
    },
    {
      key: "/reports",
      icon: <BarChart3 size={20} />,
      label: "Reports",
    },
    {
      key: "/users",
      icon: <Users size={20} />,
      label: "Users",
      hidden: user?.role !== UserRole.ADMIN,
    },
    {
      key: "/settings",
      icon: <Settings size={20} />,
      label: "Settings",
    },
  ].filter((item) => !item.hidden);

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="light"
      className="border-r border-gray-200 dark:border-gray-800"
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl overflow-hidden px-4">
          <CheckSquare size={28} className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">TaskFlow</span>}
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-64px)] justify-between">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={handleMenuClick}
          className="border-none mt-2"
        />

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div
            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
            onClick={logout}
          >
            <LogOut size={20} className="text-gray-500 hover:text-red-500" />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-gray-400">Logout</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
