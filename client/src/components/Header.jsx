import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Avatar,
  Badge,
  theme,
  Popover,
  List,
  Typography,
  Space,
  message,
  Empty,
  Tag,
} from "antd";
import {
  Menu as MenuIcon,
  Moon,
  Sun,
  Bell,
  HelpCircle,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../context/Auth/Auth.context";
import { useTheme } from "../context/Theme/Theme.context";
import notificationService from "../services/notification.service";
import teamService from "../services/team.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom"; // Import useNavigate

dayjs.extend(relativeTime);

const { Header } = Layout;
const { Text } = Typography;

const HeaderComponent = ({
  collapsed,
  setCollapsed,
  mobileDrawerOpen,
  setMobileDrawerOpen,
}) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);
  const navigate = useNavigate(); // Init navigate

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleToggle = () => {
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res && res.metadata) {
        setNotifications(res.metadata);
        setUnreadCount(res.metadata.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý mở Popover -> Đánh dấu đã đọc
  const handleOpenChange = async (visible) => {
    setOpenNotif(visible);
    if (visible) {
      // Nếu có tin chưa đọc thì gọi API đánh dấu đã đọc hết
      if (unreadCount > 0) {
        try {
          await notificationService.markAllAsRead();
          setUnreadCount(0); // Update UI ngay lập tức
          // Cập nhật lại state local để UI List chuyển sang màu đã đọc
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (error) {
          console.error("Failed to mark all as read");
        }
      }
      fetchNotifications();
    }
  };

  const handleRespondInvite = async (notifId, accept) => {
    try {
      await teamService.respondInvite(notifId, accept);
      message.success(
        accept ? "Joined team successfully!" : "Invite declined."
      );

      // Refresh notifications & Reload to update User Context (Team ID)
      await fetchNotifications();
      if (accept) {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      // Hiển thị lỗi chi tiết từ Backend (VD: "Bạn đã ở trong nhóm khác")
      const errorMsg = error.response?.data?.message || "Action failed";
      message.error(errorMsg);
    }
  };

  const handleNotificationClick = (item) => {
    if (item.payload && item.payload.taskId) {
      navigate(`/tasks/${item.payload.taskId}`);
      setOpenNotif(false); // Close popover
    }
  };

  const notificationContent = (
    <div className="w-[350px] max-h-[400px] overflow-y-auto">
      <List
        dataSource={notifications}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No notifications"
            />
          ),
        }}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleNotificationClick(item)}
            className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors px-4 py-3 cursor-pointer ${!item.isRead ? "bg-blue-50 dark:bg-blue-900/10" : ""
              }`}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={item.senderId?.avatar}>
                  {item.senderId?.name?.[0]}
                </Avatar>
              }
              title={
                <div className="flex justify-between">
                  <Text strong={!item.isRead} className="text-sm">
                    {item.title}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {dayjs(item.createdAt).fromNow()}
                  </Text>
                </div>
              }
              description={
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {item.message}
                  </div>
                  {item.type === "TEAM_INVITE" && item.status === "pending" && (
                    <Space size="small">
                      <Button
                        size="small"
                        type="primary"
                        icon={<Check size={12} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRespondInvite(item._id, true);
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<X size={12} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRespondInvite(item._id, false);
                        }}
                      >
                        Decline
                      </Button>
                    </Space>
                  )}
                  {item.type === "TEAM_INVITE" && item.status !== "pending" && (
                    <Tag color={item.status === "accepted" ? "green" : "red"}>
                      {item.status.toUpperCase()}
                    </Tag>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Header
      style={{ padding: "0 16px", background: colorBgContainer }}
      className="flex items-center justify-between sticky top-0 z-10 shadow-sm"
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={<MenuIcon size={20} />}
          onClick={handleToggle}
          style={{ width: 46, height: 46 }}
        />
        <h2 className="ml-4 text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
          Overview
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          type="text"
          shape="circle"
          icon={darkMode ? <Sun size={20} /> : <Moon size={20} />}
          onClick={toggleTheme}
        />

        <Popover
          content={notificationContent}
          title="Notifications"
          trigger="click"
          placement="bottomRight"
          open={openNotif}
          onOpenChange={handleOpenChange} // Dùng hàm handle mới
        >
          <Badge count={unreadCount} overflowCount={99} size="small">
            <Button type="text" shape="circle" icon={<Bell size={20} />} />
          </Badge>
        </Popover>

        <Button
          type="text"
          shape="circle"
          icon={<HelpCircle size={20} />}
          className="hidden sm:inline-flex"
        />

        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
          <Avatar
            src={user?.avatar}
            style={{ backgroundColor: "#1677ff" }}
            size="default"
          >
            {user?.name?.[0] || "U"}
          </Avatar>
          <div className="hidden md:block leading-tight">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.name}
            </div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default HeaderComponent;
