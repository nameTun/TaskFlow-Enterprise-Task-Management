import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Statistic,
  Table,
  Tag,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  message,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth/Auth.context";
import {
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  Plus,
  Filter,
} from "lucide-react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State quản lý Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State quản lý dữ liệu Task
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State bộ lọc
  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    priority: undefined,
  });

  // Hàm gọi API lấy danh sách Task
  const fetchTasks = useCallback(
    async (page = 1, pageSize = 10, currentFilters = filters) => {
      setLoading(true);
      try {
        // Clean params: loại bỏ các giá trị undefined/null/rỗng
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

        // Response structure: { message, metadata: { tasks, pagination } }
        if (response && response.metadata) {
          setTasks(response.metadata.tasks);
          setPagination({
            current: response.metadata.pagination.page,
            pageSize: response.metadata.pagination.limit,
            total: response.metadata.pagination.total,
          });
        }
      } catch (error) {
        console.error("Fetch tasks error:", error);
        message.error("Không thể tải danh sách công việc");
      } finally {
        setLoading(false);
      }
    },
    []
  ); // filters được truyền vào function arg nên không cần dependency ở đây để tránh loop
  // const isCheckedRef = React.useRef(false);

  // Gọi API khi component mount hoặc khi filter thay đổi (trừ search text handle riêng)
  useEffect(() => {
    // if (isCheckedRef.current) {
    //   return;
    // }
    // isCheckedRef.current = true;

    fetchTasks(1, pagination.pageSize, filters);
  }, [fetchTasks, filters.status, filters.priority]);

  // Handle Table Change (Phân trang)
  const handleTableChange = (newPagination) => {
    fetchTasks(newPagination.current, newPagination.pageSize, filters);
  };

  // Handle Search Text (Debounce hoặc Enter)
  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchTasks(1, pagination.pageSize, newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // useEffect sẽ tự trigger fetchTasks vì dependency [filters.status, filters.priority]
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    fetchTasks(1, pagination.pageSize, filters);
  };

  // Mock Stats (Bạn có thể tạo API riêng cho thống kê sau)
  const stats = [
    {
      title: "Total Tasks",
      value: pagination.total,
      prefix: <Briefcase size={20} />,
      color: "#1677ff",
      bg: "rgba(22, 119, 255, 0.1)",
    },
    {
      title: "Pending",
      value: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      prefix: <Clock size={20} />,
      color: "#faad14",
      bg: "rgba(250, 173, 20, 0.1)",
    },
    {
      title: "Processing",
      value: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      prefix: <Users size={20} />,
      color: "#52c41a",
      bg: "rgba(82, 196, 26, 0.1)",
    },
    {
      title: "Done",
      value: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      prefix: <CheckCircle2 size={20} />,
      color: "#722ed1",
      bg: "rgba(114, 46, 209, 0.1)",
    },
  ];

  const columns = [
    {
      title: "Task Info",
      dataIndex: "title",
      key: "title",
      fixed: "left",
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
        if (status === TaskStatus.REVIEW) color = "purple";
        return <Tag color={color}>{TaskStatusLabels[status] || status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/tasks/${record.id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <span className="text-gray-500">
            Welcome back,{" "}
            <strong>{user?.name || user?.fullName || "User"}</strong>! Here is
            your workspace activity.
          </span>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          size="large"
          className="w-full md:w-auto"
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Task
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              bordered={false}
              className="shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <Statistic
                title={
                  <span className="text-gray-500 font-medium">
                    {stat.title}
                  </span>
                }
                value={stat.value}
                prefix={
                  <div
                    style={{ color: stat.color, backgroundColor: stat.bg }}
                    className="p-2 rounded-lg mr-2 flex items-center justify-center"
                  >
                    {stat.prefix}
                  </div>
                }
                valueStyle={{ fontWeight: "bold" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Tasks Management" bordered={false} className="shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
              onChange={(val) => handleFilterChange("status", val)}
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
              onChange={(val) => handleFilterChange("priority", val)}
            >
              <Option value="all">All Priority</Option>
              {Object.values(TaskPriority).map((p) => (
                <Option key={p} value={p}>
                  {TaskPriorityLabels[p]}
                </Option>
              ))}
            </Select>
          </div>
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

      {/* Modal Tạo Task */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
};

export default Dashboard;
