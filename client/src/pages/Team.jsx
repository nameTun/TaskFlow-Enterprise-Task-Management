import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Typography,
  Tag,
  Avatar,
  Space,
  Empty,
  Modal,
  Form,
  Select,
  message,
  Spin,
  Input,
} from "antd";
import { Users, Plus, Shield, Trash2, Search, LogOut } from "lucide-react";
import teamService from "../services/team.service";
import userService from "../services/user.service";
import { useAuth } from "../context/Auth/Auth.context";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const TeamPage = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Create Team Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await teamService.getMyTeam();
      if (res && res.metadata) {
        setTeam(res.metadata);
      } else {
        setTeam(null);
      }
    } catch (error) {
      console.error(error);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSearchUser = async (value) => {
    if (!value) {
      setSearchOptions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await userService.searchUsers(value);
      if (res && res.metadata) {
        const existingMemberIds = team?.members?.map((m) => m.userId) || [];
        const filtered = res.metadata.filter(
          (u) => !existingMemberIds.includes(u._id)
        );
        setSearchOptions(filtered);
      }
    } catch (error) {
      console.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateTeam = async (values) => {
    try {
      await teamService.createTeam(values);
      message.success("Team created!");
      setIsCreateModalOpen(false);
      // Reload để cập nhật user context
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed");
    }
  };

  const handleInvite = async (values) => {
    try {
      await teamService.inviteMember(values.email);
      message.success("Invitation sent! Waiting for acceptance.");
      setIsInviteModalOpen(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to invite");
    }
  };

  const handleRemoveMember = (memberId) => {
    Modal.confirm({
      title: "Remove Member?",
      content: "Are you sure you want to remove this member from the team?",
      okType: "danger",
      onOk: async () => {
        try {
          await teamService.removeMember(memberId);
          message.success("Member removed");
          fetchTeam();
        } catch (error) {
          message.error("Failed to remove member");
        }
      },
    });
  };

  const handleLeaveTeam = () => {
    Modal.confirm({
      title: "Leave Team?",
      content:
        "Are you sure you want to leave this team? You will lose access to team tasks.",
      okType: "danger",
      okText: "Leave",
      onOk: async () => {
        try {
          await teamService.leaveTeam();
          message.success("You have left the team.");
          setTimeout(() => window.location.reload(), 500);
        } catch (error) {
          message.error(
            error.response?.data?.message || "Failed to leave team"
          );
        }
      },
    });
  };

  // Helper check quyền quản lý (Admin hoặc Team Lead của team này)
  const isManager = user?.role === "admin" || user?.role === "team_lead";

  const columns = [
    {
      title: "Member",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar}>{record.name?.[0]}</Avatar>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={
            role === "team_lead" || team?.lead?.id === role?.userId
              ? "blue"
              : "default"
          }
          className="uppercase"
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        // Hiển thị nút xóa nếu:
        // 1. User hiện tại là Manager (Admin/Lead)
        // 2. Không xóa chính mình
        if (isManager && record.userId !== user?.id) {
          return (
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              onClick={() => handleRemoveMember(record.userId)}
            />
          );
        }
        return null;
      },
    },
  ];

  if (!team && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <Empty
          description={
            <span className="text-gray-500 text-lg">
              You are not part of any team yet.
            </span>
          }
        />
        <Button
          type="primary"
          size="large"
          icon={<Plus size={18} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Your Team
        </Button>

        <Modal
          title="Create New Team"
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
          footer={null}
        >
          <Form onFinish={handleCreateTeam} layout="vertical" className="mt-4">
            <Form.Item
              name="name"
              label="Team Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Team
            </Button>
          </Form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} className="!mb-1">
            {team?.name}
          </Title>
          <Text type="secondary" className="flex items-center gap-1">
            <Shield size={14} /> Managed by {team?.lead?.name}
          </Text>
        </div>
        <Space>
          {isManager ? (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Member
            </Button>
          ) : (
            <Button
              danger
              icon={<LogOut size={16} />}
              onClick={handleLeaveTeam}
            >
              Leave Team
            </Button>
          )}
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Table
          loading={loading}
          dataSource={team?.members}
          columns={columns}
          rowKey="userId"
          pagination={false}
        />
      </Card>

      <Modal
        title="Invite Member to Team"
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        footer={null}
      >
        <Form onFinish={handleInvite} layout="vertical" className="mt-4">
          <Paragraph type="secondary">
            Search for users by name or email. They must not belong to another
            team.
          </Paragraph>
          <Form.Item
            name="email"
            label="Select User"
            rules={[{ required: true, message: "Please select a user" }]}
          >
            <Select
              showSearch
              placeholder="Type name or email..."
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={handleSearchUser}
              notFoundContent={searchLoading ? <Spin size="small" /> : null}
              size="large"
            >
              {searchOptions.map((u) => (
                <Option key={u._id} value={u.email}>
                  <div className="flex items-center gap-2">
                    <Avatar size="small" src={u.avatar}>
                      {u.name?.[0]}
                    </Avatar>
                    <span>
                      {u.name} ({u.email})
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Send Invite
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamPage;
