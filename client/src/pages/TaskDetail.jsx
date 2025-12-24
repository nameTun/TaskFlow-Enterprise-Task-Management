
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, List, Checkbox, Button, Typography, Space, Divider, Avatar, Select } from 'antd';
import { ArrowLeft, Check, Edit, FileText, Download, Calendar } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../constants/constant';

const { Title, Paragraph } = Typography;

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const task = {
    id: id || 'TASK-2048',
    title: 'Finalize Q3 Marketing Report',
    description: 'Compile data from the sales team and draft the initial executive summary.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assignee: { name: 'Nguyen Van A', avatar: 'https://i.pravatar.cc/150?u=a' },
    reporter: { name: 'Admin User', avatar: 'https://i.pravatar.cc/150?u=b' },
    dueDate: '2023-10-24',
    department: 'Marketing',
    subtasks: [
      { id: '1', title: 'Gather sales metrics from Salesforce', isCompleted: true },
      { id: '2', title: 'Draft executive summary text', isCompleted: false },
      { id: '3', title: 'Review formatting with design team', isCompleted: false },
    ],
    attachments: [
      { id: 'a1', name: 'guidelines_v2.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 'a2', name: 'raw_data_export.xlsx', size: '850 KB', type: 'excel' },
    ]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back to Tasks</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>{task.title}</Title>
          <Space className="mt-2">
            <Tag color="blue">{task.id}</Tag>
            <Tag color="geekblue">{task.department}</Tag>
          </Space>
        </div>
        <Space>
            <Button icon={<Edit size={16} />}>Edit</Button>
            <Button type="primary" icon={<Check size={16} />}>Complete</Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Description" bordered={false} className="shadow-sm">
            <Paragraph className="text-gray-600">{task.description}</Paragraph>
            <Divider />
            <Title level={5}>Attachments</Title>
            <List
              itemLayout="horizontal"
              dataSource={task.attachments}
              renderItem={(item) => (
                <List.Item
                  actions={[<Button type="text" icon={<Download size={16} />} />]}
                  className="border border-gray-100 rounded-lg p-3 mb-2 hover:bg-gray-50 transition-colors"
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileText size={20} />} className="bg-blue-100 text-blue-600" />}
                    title={item.name}
                    description={item.size}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Details" bordered={false} className="shadow-sm">
            <Descriptions column={1} layout="vertical">
              <Descriptions.Item label="Status">
                 <Select defaultValue={task.status} style={{ width: '100%' }}>
                    {Object.values(TaskStatus).map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                 </Select>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Select defaultValue={task.priority} style={{ width: '100%' }}>
                    {Object.values(TaskPriority).map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
                 </Select>
              </Descriptions.Item>
              <Descriptions.Item label="Assignee">
                <Space>
                    <Avatar src={task.assignee.avatar} />
                    <span>{task.assignee.name}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                <Space>
                    <Calendar size={16} className="text-gray-400" />
                    <span>{task.dueDate}</span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
