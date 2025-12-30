import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Space,
  Card,
  Typography,
  Avatar,
  message,
  Modal,
  Select,
  Tooltip,
  Form,
} from "antd";
import { Search, Plus, Trash2, User, Mail, Lock } from "lucide-react";
import { UserRole } from "../constants/constant";
import userService from "../services/user.service";
import { useAuth } from "../context/Auth/Auth.context";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(undefined);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch Users Function
  const fetchUsers = useCallback(
    async (page = 1, pageSize = 10, search = "", role = undefined) => {
      setLoading(true);
      try {
        const res = await userService.getAllUsers({
          page,
          limit: pageSize,
          q: search,
          role: role === "all" ? undefined : role,
        });

        if (res && res.metadata) {
          setUsers(res.metadata.users);
          setPagination({
            current: res.metadata.pagination.page,
            pageSize: res.metadata.pagination.limit,
            total: res.metadata.pagination.total,
          });
        }
      } catch (error) {
        console.error(error);
        // message.error('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(1, pagination.pageSize, searchText, roleFilter);
  }, [fetchUsers, roleFilter]);

  const handleTableChange = (newPagination) => {
    fetchUsers(
      newPagination.current,
      newPagination.pageSize,
      searchText,
      roleFilter
    );
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchUsers(1, pagination.pageSize, value, roleFilter);
  };

  // Create User
  const handleCreateUser = async (values) => {
    setCreateLoading(true);
    try {
      await userService.createUser(values);
      message.success("Tạo người dùng mới thành công");
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchUsers(1, pagination.pageSize, searchText, roleFilter);
    } catch (error) {
      message.error(error.response?.data?.message || "Tạo thất bại");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Actions
  const handleChangeRole = (userId, newRole) => {
    Modal.confirm({
      title: "Thay đổi quyền hạn?",
      content: `Bạn có chắc muốn đổi quyền người dùng này thành ${newRole}?`,
      onOk: async () => {
        try {
          await userService.updateUserRole(userId, newRole);
          message.success("Cập nhật quyền thành công");
          fetchUsers(
            pagination.current,
            pagination.pageSize,
            searchText,
            roleFilter
          );
        } catch (error) {
          message.error(error.response?.data?.message || "Cập nhật thất bại");
        }
      },
    });
  };

  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: "Khóa tài khoản?",
      content: "Người dùng sẽ không thể đăng nhập vào hệ thống nữa.",
      okType: "danger",
      okText: "Khóa tài khoản",
      onOk: async () => {
        try {
          await userService.deleteUser(userId);
          message.success("Đã khóa tài khoản");
          fetchUsers(
            pagination.current,
            pagination.pageSize,
            searchText,
            roleFilter
          );
        } catch (error) {
          message.error(error.response?.data?.message || "Thất bại");
        }
      },
    });
  };

  const columns = [
    {
      title: "User Profile",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} style={{ backgroundColor: "#1677ff" }}>
            {text?.[0]}
          </Avatar>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Team",
      dataIndex: "teamName",
      key: "teamName",
      render: (teamName) =>
        teamName ? (
          <Tag color="blue">{teamName}</Tag>
        ) : (
          <Text type="secondary" italic>
            No Team
          </Text>
        ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role, record) => {
        if (record.id === currentUser?.id) {
          return <Tag color="purple">ADMIN (YOU)</Tag>;
        }

        return (
          <Select
            value={role}
            style={{ width: 120 }}
            onChange={(val) => handleChangeRole(record.id, val)}
            size="small"
            bordered={false}
            className="bg-gray-50 dark:bg-gray-800 rounded border border-transparent hover:border-gray-300"
          >
            <Option value="admin">Admin</Option>
            <Option value="team_lead">Team Lead</Option>
            <Option value="user">User</Option>
            <Option value="viewer">Viewer</Option>
          </Select>
        );
      },
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      render: (date) => (
        <span className="text-gray-500 text-sm">
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.id !== currentUser?.id && (
            <Tooltip title="Block User">
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                onClick={() => handleDeleteUser(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            User Management
          </Title>
          <span className="text-gray-500">
            Manage access, roles and account status.
          </span>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          size="large"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Invite New User
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between">
          <Input.Search
            placeholder="Search by name or email"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search size={16} className="text-gray-400" />}
          />

          <div className="flex gap-2">
            <Select
              placeholder="Filter by Role"
              style={{ width: 150 }}
              allowClear
              onChange={setRoleFilter}
              defaultValue="all"
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="team_lead">Team Lead</Option>
              <Option value="user">User</Option>
            </Select>
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="Create New User"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreateUser}
          className="mt-4"
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input
              prefix={<User size={16} className="text-gray-400" />}
              placeholder="John Doe"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              prefix={<Mail size={16} className="text-gray-400" />}
              placeholder="john@example.com"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password
              prefix={<Lock size={16} className="text-gray-400" />}
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item name="role" label="Role" initialValue="user">
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="team_lead">Team Lead</Option>
              <Option value="user">User</Option>
              <Option value="viewer">Viewer</Option>
            </Select>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createLoading}
          >
            Create User
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
