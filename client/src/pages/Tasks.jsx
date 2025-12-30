import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Tag,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  message,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import { Plus, Filter } from "lucide-react";
import {
  TaskStatus,
  TaskPriority,
  TaskStatusLabels,
  TaskPriorityLabels,
} from "../constants/constant";
import CreateTaskModal from "../components/CreateTaskModal";
import taskService from "../services/task.service";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const TasksPage = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    priority: undefined,
  });

  const fetchTasks = useCallback(
    async (page = 1, pageSize = 10, currentFilters = filters) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: pageSize,
          search: currentFilters.search,
          status:
            currentFilters.status === "all" ? undefined : currentFilters.status,
          priority:
            currentFilters.priority === "all"
              ? undefined
              : currentFilters.priority,
        };

        const response = await taskService.getTasks(params);
        if (response && response.metadata) {
          setTasks(response.metadata.tasks);
          setPagination({
            current: response.metadata.pagination.page,
            pageSize: response.metadata.pagination.limit,
            total: response.metadata.pagination.total,
          });
        }
      } catch (error) {
        message.error("Không thể tải danh sách công việc");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTasks(1, pagination.pageSize, filters);
  }, [fetchTasks, filters.status, filters.priority]);

  const handleTableChange = (newPagination) => {
    fetchTasks(newPagination.current, newPagination.pageSize, filters);
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchTasks(1, pagination.pageSize, newFilters);
  };

  const columns = [
    {
      title: "Task Info",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text, record) => (
        <div>
          <div className="font-medium truncate text-blue-600 hover:underline">
            {text}
          </div>
          <div className="text-xs text-gray-400">{record.id}</div>
        </div>
      ),
    },
    {
      title: "Assignee",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 150,
      render: (assignedTo) =>
        assignedTo ? (
          <Space>
            <Avatar size="small" src={assignedTo.avatar}>
              {assignedTo.name?.[0]}
            </Avatar>
            <span className="text-sm">{assignedTo.name}</span>
          </Space>
        ) : (
          <span className="text-gray-400 italic">Unassigned</span>
        ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        let color = "default";
        if (priority === TaskPriority.HIGH) color = "red";
        if (priority === TaskPriority.MEDIUM) color = "orange";
        if (priority === TaskPriority.URGENT) color = "magenta";
        return (
          <Tag color={color}>{TaskPriorityLabels[priority] || priority}</Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        if (status === TaskStatus.DONE) color = "green";
        if (status === TaskStatus.IN_PROGRESS) color = "blue";
        return <Tag color={color}>{TaskStatusLabels[status] || status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/tasks/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Work Items
          </Title>
          <span className="text-gray-500">
            Manage, track, and assign tasks for your team.
          </span>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          size="large"
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Task
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input.Search
            placeholder="Search tasks..."
            onSearch={handleSearch}
            allowClear
            className="w-full md:w-[250px]"
            prefix={<Filter size={14} className="text-gray-400 mr-1" />}
          />
          <Select
            placeholder="Filter by Status"
            style={{ width: 180 }}
            allowClear
            onChange={(val) => setFilters((prev) => ({ ...prev, status: val }))}
          >
            <Option value="all">All Status</Option>
            {Object.values(TaskStatus).map((s) => (
              <Option key={s} value={s}>
                {TaskStatusLabels[s]}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Priority"
            style={{ width: 180 }}
            allowClear
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, priority: val }))
            }
          >
            <Option value="all">All Priority</Option>
            {Object.values(TaskPriority).map((p) => (
              <Option key={p} value={p}>
                {TaskPriorityLabels[p]}
              </Option>
            ))}
          </Select>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          onRow={(record) => ({
            onClick: () => navigate(`/tasks/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      <CreateTaskModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchTasks(1, pagination.pageSize, filters)}
      />
    </div>
  );
};

export default TasksPage;
