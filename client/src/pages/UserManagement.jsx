
import React from 'react';
import { Table, Tag, Button, Input, Space, Card, Typography, Avatar } from 'antd';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { UserRole } from '../constants/constant';

const { Title } = Typography;

const UserManagement = () => {
  const users = [
    { key: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@company.com', role: UserRole.ADMIN, dept: 'IT', status: 'active', lastActive: '2 mins ago' },
    { key: '2', name: 'Trần Thị B', email: 'tranthib@company.com', role: UserRole.TEAM_LEAD, dept: 'Marketing', status: 'active', lastActive: '1 hour ago' },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#87d068' }}>{text[0]}</Avatar>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.dept}</div>
          </div>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'geekblue';
        if (role === UserRole.ADMIN) color = 'purple';
        if (role === UserRole.TEAM_LEAD) color = 'cyan';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'active' ? 'success' : 'error'}>{status.toUpperCase()}</Tag>,
    },
    { title: 'Last Active', dataIndex: 'lastActive', key: 'lastActive', className: 'text-gray-500' },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space>
          <Button type="text" icon={<Edit size={16} />} className="text-blue-600" />
          <Button type="text" icon={<Trash2 size={16} />} className="text-red-500" />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>User Management</Title>
          <span className="text-gray-500">Manage access and roles for your team members.</span>
        </div>
        <Button type="primary" icon={<Plus size={16} />} size="large">Add User</Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="mb-4 flex justify-between">
           <Input placeholder="Search by name or email" prefix={<Search size={16} className="text-gray-400" />} style={{ width: 300 }} />
        </div>
        <Table columns={columns} dataSource={users} />
      </Card>
    </div>
  );
};

export default UserManagement;
