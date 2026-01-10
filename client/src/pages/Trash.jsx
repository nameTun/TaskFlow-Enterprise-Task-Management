import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Typography,
  Tag,
  Space,
  message,
  Modal,
  Card,
  Avatar,
} from "antd";
import { RotateCcw, Trash2 } from "lucide-react";
import taskService from "../services/task.service";
import dayjs from "dayjs";

const { Title } = Typography;
const { confirm } = Modal;

const Trash = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTrash();
      if (response && response.metadata) {
        setTasks(response.metadata);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải thùng rác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = (taskId) => {
    confirm({
      title: "Khôi phục công việc?",
      content: "Công việc này sẽ xuất hiện trở lại trong Dashboard.",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await taskService.restoreTask(taskId);
          message.success("Đã khôi phục công việc");
          fetchTrash(); // Refresh list
        } catch (error) {
          message.error("Khôi phục thất bại");
        }
      },
    });
  };

  const handleDeleteForever = (taskId) => {
    confirm({
      title: "Xóa vĩnh viễn công việc?",
      content: "Hành động này KHÔNG THỂ hoàn tác. Bạn có chắc chắn muốn xóa?",
      okText: "Xóa vĩnh viễn",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await taskService.deletePermanentTask(taskId);
          message.success("Đã xóa vĩnh viễn công việc");
          fetchTrash();
        } catch (error) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const columns = [
    {
      title: "Task Info",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-medium line-through text-gray-500">{text}</div>
          <div className="text-xs text-gray-400">{record.id}</div>
        </div>
      ),
    },
    {
      title: "Deleted By",
      dataIndex: "deletedBy",
      key: "deletedBy",
      render: (deletedBy) =>
        deletedBy ? (
          <Space>
            <Avatar size="small" src={deletedBy.avatar}>
              {deletedBy.name?.[0]}
            </Avatar>
            <span className="text-sm text-gray-600">{deletedBy.name}</span>
          </Space>
        ) : (
          <span className="text-gray-400 italic">Unknown</span>
        ),
    },
    {
      title: "Deleted Date",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => <Tag>{priority}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            icon={<RotateCcw size={16} />}
            size="small"
            onClick={() => handleRestore(record.id || record._id)}
          >
            Restore
          </Button>
          <Button
            type="primary"
            danger
            icon={<Trash2 size={16} />}
            size="small"
            onClick={() => handleDeleteForever(record.id || record._id)}
          >
            Delete Forever
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Trash Bin
          </Title>
          <span className="text-gray-500">Restore deleted tasks here.</span>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey={(record) => record.id || record._id}
          columns={columns}
          dataSource={tasks}
          loading={loading}
          locale={{ emptyText: "Thùng rác trống" }}
        />
      </Card>
    </div>
  );
};

export default Trash;
