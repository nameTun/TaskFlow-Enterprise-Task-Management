import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  List,
  Button,
  Typography,
  Space,
  Divider,
  Avatar,
  Select,
  Row,
  Col,
  Spin,
  message,
  Modal,
  Tabs,
} from "antd";
import {
  ArrowLeft,
  Check,
  Edit,
  FileText,
  Download,
  Calendar,
  Trash2,
  MessageSquare,
  History,
} from "lucide-react";
import {
  TaskStatus,
  TaskPriority,
  TaskStatusLabels,
  TaskPriorityLabels,
} from "../constants/constant";
import taskService from "../services/task.service";
import EditTaskModal from "../components/EditTaskModal"; // Import Component Mới
import SubtaskList from "../components/SubtaskList";
import CommentSection from "../components/CommentSection";
import ActivityTimeline from "../components/ActivityTimeline";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // State quản lý Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch Task Detail
  const fetchTaskDetail = useCallback(async () => {
    try {
      setLoading(true);
      // sử dụng useParams cảu thư viện react-router-dom để có thể lấy được id, vd như /task/TASK-001
      const response = await taskService.getTaskById(id);
      if (response && response.metadata) {
        setTask(response.metadata);
      }
    } catch (error) {
      console.error("Fetch detail error:", error);
      message.error("Không thể tải thông tin công việc");
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  // Handle Update Task (Quick Status/Priority update from Sidebar)
  const handleQuickUpdate = async (field, value) => {
    try {
      setUpdating(true);
      await taskService.updateTask(task._id || task.id, { [field]: value });
      setTask((prev) => ({ ...prev, [field]: value }));
      message.success(`Cập nhật ${field} thành công`);
    } catch (error) {
      console.error("Update error:", error);
      message.error("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  // Handle Update Content Success (From Modal)
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchTaskDetail(); // Tải lại toàn bộ thông tin task mới nhất từ server
  };

  // Optimize: Update Local State without Refetching
  const handleTaskUpdate = (updatedTask) => {
    // If updatedTask is the full response object, try to get metadata
    const newData = updatedTask.metadata ? updatedTask.metadata : updatedTask;
    setTask((prev) => ({ ...prev, ...newData }));
  };

  // Handle Delete
  const handleDelete = () => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa công việc này?",
      content: "Hành động này sẽ chuyển công việc vào thùng rác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await taskService.deleteTask(task._id || task.id);
          message.success("Đã xóa công việc");
          navigate("/tasks");
        } catch (error) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spin size="large" tip="Loading task details..." />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div
        className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        <span>Back to Tasks</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title
            level={2}
            style={{ margin: 0 }}
            className="text-xl md:text-2xl"
          >
            {task.title}
          </Title>
          <Space className="mt-2 flex-wrap">
            <Tag color="blue">{task.id}</Tag>
            <Tag color="geekblue">{task.department || "General"}</Tag>
            {task.createdAt && (
              <span className="text-gray-400 text-sm">
                Created {dayjs(task.createdAt).format("DD/MM/YYYY")}
              </span>
            )}
          </Space>
        </div>
        <Space className="w-full md:w-auto justify-start md:justify-end">
          <Button
            icon={<Edit size={16} />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Content
          </Button>
          <Button danger icon={<Trash2 size={16} />} onClick={handleDelete}>
            Delete
          </Button>
          {task.status !== TaskStatus.DONE && (
            <Button
              type="primary"
              icon={<Check size={16} />}
              onClick={() => handleQuickUpdate("status", TaskStatus.DONE)}
            >
              Mark Complete
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Content Column */}
        <Col xs={24} lg={16}>
          <div className="space-y-6">
            <Card title="Description" bordered={false} className="shadow-sm">
              <Paragraph className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {task.description || "No description provided."}
              </Paragraph>

              {/* Attachments Section (Placeholder for Phase 4) */}
              {task.attachments && task.attachments.length > 0 && (
                <>
                  <Divider />
                  <Title level={5}>Attachments</Title>
                  <List
                    itemLayout="horizontal"
                    dataSource={task.attachments}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button type="text" icon={<Download size={16} />} />,
                        ]}
                        className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<FileText size={20} />}
                              className="bg-blue-100 text-blue-600"
                            />
                          }
                          title={
                            <span className="text-gray-800 dark:text-gray-200">
                              {item.name}
                            </span>
                          }
                          description={item.size}
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Card>

            {/* Checklist Section */}
            <Card className="shadow-sm mb-6">
              <SubtaskList
                task={task}
                onUpdate={fetchTaskDetail}
                onTaskUpdate={handleTaskUpdate}
              />
            </Card>

            {/* Collaboration Section (Tabs) */}
            <Card className="shadow-sm">
              <Tabs
                defaultActiveKey="1"
                items={[
                  {
                    key: '1',
                    label: (
                      <span className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        Comments
                      </span>
                    ),
                    children: <CommentSection taskId={task._id || task.id} />,
                  },
                  {
                    key: '2',
                    label: (
                      <span className="flex items-center gap-2">
                        <History size={16} />
                        History
                      </span>
                    ),
                    children: <ActivityTimeline taskId={task._id || task.id} />,
                  },
                ]}
              />
            </Card>
          </div>
        </Col>

        {/* Sidebar Info Column */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            <Card title="Details" bordered={false} className="shadow-sm">
              <Descriptions column={1} layout="vertical">
                <Descriptions.Item label="Status">
                  <Select
                    value={task.status}
                    style={{ width: "100%" }}
                    onChange={(val) => handleQuickUpdate("status", val)}
                    loading={updating}
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <Select.Option key={s} value={s}>
                        {TaskStatusLabels[s]}
                      </Select.Option>
                    ))}
                  </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Priority">
                  <Select
                    value={task.priority}
                    style={{ width: "100%" }}
                    onChange={(val) => handleQuickUpdate("priority", val)}
                    loading={updating}
                  >
                    {Object.values(TaskPriority).map((p) => (
                      <Select.Option key={p} value={p}>
                        {TaskPriorityLabels[p]}
                      </Select.Option>
                    ))}
                  </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Assignee">
                  {task.assignedTo ? (
                    <Space>
                      <Avatar src={task.assignedTo.avatar}>
                        {task.assignedTo.name?.[0]}
                      </Avatar>
                      <div>
                        <div className="text-gray-700 dark:text-gray-300 font-medium">
                          {task.assignedTo.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {task.assignedTo.email}
                        </div>
                      </div>
                    </Space>
                  ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Reporter">
                  {task.createdBy ? (
                    <Space>
                      <Avatar size="small" src={task.createdBy.avatar}>
                        {task.createdBy.name?.[0]}
                      </Avatar>
                      <span className="text-gray-700 dark:text-gray-300">
                        {task.createdBy.name}
                      </span>
                    </Space>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Dates">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-500">Start:</span>
                      <span>
                        {task.startDate
                          ? dayjs(task.startDate).format("DD/MM/YYYY")
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-red-400" />
                      <span className="text-gray-500">Due:</span>
                      <span
                        className={
                          task.dueDate && dayjs(task.dueDate).isBefore(dayjs())
                            ? "text-red-500 font-medium"
                            : ""
                        }
                      >
                        {task.dueDate
                          ? dayjs(task.dueDate).format("DD/MM/YYYY")
                          : "No deadline"}
                      </span>
                    </div>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Modal Chỉnh sửa Task */}
      <EditTaskModal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        task={task}
      />
    </div >
  );
};

export default TaskDetail;
