import React from "react";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth/Auth.context";
import { UserRole } from "../constants/constant";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Settings,
  LogOut,
  Trash2,
  Briefcase,
} from "lucide-react";

const Sidebar = ({ collapsed, isMobile, closeDrawer }) => {
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
      key: "/users",
      icon: <Users size={20} />,
      label: "All Users",
      hidden: user?.role !== UserRole.ADMIN,
    },
    {
      key: "/team",
      icon: <Briefcase size={20} />,
      label: "My Team",
      hidden: false,
    },
    // Đã xóa menu Reports vì dư thừa
    {
      key: "/trash",
      icon: <Trash2 size={20} />,
      label: "Trash",
    },
    {
      key: "/settings",
      icon: <Settings size={20} />,
      label: "Settings",
    },
  ].filter((item) => !item.hidden);

  const handleMenuClick = (e) => {
    navigate(e.key);
    if (isMobile && closeDrawer) {
      closeDrawer();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#141414] dark:text-gray-200">
      <div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl overflow-hidden px-4">
          <CheckSquare size={28} className="shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap text-gray-900 dark:text-white">
              TaskFlow
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <Menu
          theme="light" // Hoặc dark tùy setting
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={handleMenuClick}
          className="border-none !bg-transparent"
          style={{ background: "transparent" }}
        />
      </div>

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
                {user?.fullName || user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400">Logout</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
