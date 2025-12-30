import React, { useState } from "react";
import {
  Tabs,
  Card,
  Form,
  Input,
  Button,
  Switch,
  Typography,
  Avatar,
  Upload,
  message,
  Divider,
  Alert,
} from "antd";
import {
  User,
  Lock,
  Server,
  Bell,
  Upload as UploadIcon,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/Auth/Auth.context";
import { UserRole } from "../constants/constant";

const { Title, Text } = Typography;

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // --- TAB 1: PROFILE (Ai cũng thấy) ---
  const ProfileSettings = () => (
    <Form
      layout="vertical"
      initialValues={{ name: user?.name || user?.fullName, email: user?.email }}
    >
      <div className="flex items-center gap-6 mb-6">
        <Avatar size={80} src={user?.avatar} className="bg-blue-600 text-2xl">
          {user?.name?.[0] || "U"}
        </Avatar>
        <Upload showUploadList={false}>
          <Button icon={<UploadIcon size={16} />}>Change Avatar</Button>
        </Upload>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item label="Full Name" name="name">
          <Input
            size="large"
            prefix={<User size={18} className="text-gray-400" />}
          />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input size="large" disabled className="bg-gray-100" />
        </Form.Item>
      </div>

      <Form.Item label="Bio">
        <Input.TextArea
          rows={3}
          placeholder="Tell something about yourself..."
        />
      </Form.Item>

      <Button
        type="primary"
        loading={loading}
        onClick={() => message.success("Profile updated (Mock)")}
      >
        Save Changes
      </Button>
    </Form>
  );

  // --- TAB 2: SECURITY (Ai cũng thấy) ---
  const SecuritySettings = () => (
    <Form layout="vertical">
      <Form.Item label="Current Password" name="currentPassword" required>
        <Input.Password
          size="large"
          prefix={<Lock size={18} className="text-gray-400" />}
        />
      </Form.Item>
      <Form.Item label="New Password" name="newPassword" required>
        <Input.Password
          size="large"
          prefix={<Lock size={18} className="text-gray-400" />}
        />
      </Form.Item>
      <Form.Item label="Confirm Password" name="confirmPassword" required>
        <Input.Password
          size="large"
          prefix={<Lock size={18} className="text-gray-400" />}
        />
      </Form.Item>
      <Button
        type="primary"
        danger
        onClick={() => message.success("Password changed (Mock)")}
      >
        Update Password
      </Button>
    </Form>
  );

  // --- TAB 3: SYSTEM (Chỉ ADMIN thấy) ---
  const SystemSettings = () => (
    <div className="space-y-6">
      <Alert
        message="Vùng nguy hiểm"
        description="Thay đổi cấu hình hệ thống có thể ảnh hưởng đến toàn bộ người dùng."
        type="warning"
        showIcon
        icon={<ShieldAlert />}
      />

      <Card title="General Configuration" size="small">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
          <div>
            <Text strong>Maintenance Mode</Text>
            <div className="text-gray-500 text-xs">
              Ngăn chặn user truy cập hệ thống để bảo trì.
            </div>
          </div>
          <Switch />
        </div>
        <div className="flex justify-between items-center py-2 pt-4">
          <div>
            <Text strong>Allow New Registrations</Text>
            <div className="text-gray-500 text-xs">
              Cho phép người dùng mới đăng ký tài khoản.
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </Card>

      <Card title="Database & Backup" size="small">
        <div className="space-y-4">
          <Button icon={<Server size={16} />}>Trigger Manual Backup</Button>
          <Button danger>Clear System Cache</Button>
        </div>
      </Card>
    </div>
  );

  // Định nghĩa Tabs dựa trên Role
  const items = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <User size={16} /> Profile
        </span>
      ),
      children: <ProfileSettings />,
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <Lock size={16} /> Security
        </span>
      ),
      children: <SecuritySettings />,
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-2">
          <Bell size={16} /> Notifications
        </span>
      ),
      children: (
        <div className="p-4 text-gray-500">
          Notification settings coming soon...
        </div>
      ),
    },
  ];

  // Chỉ Admin mới có Tab System
  if (user?.role === UserRole.ADMIN) {
    items.push({
      key: "4",
      label: (
        <span className="flex items-center gap-2 text-red-500">
          <Server size={16} /> System
        </span>
      ),
      children: <SystemSettings />,
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Title level={2} style={{ margin: 0 }}>
          Settings
        </Title>
        <Text type="secondary">
          Manage your account settings and preferences.
        </Text>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Tabs defaultActiveKey="1" items={items} tabPosition="left" />
      </Card>
    </div>
  );
};

export default Settings;
