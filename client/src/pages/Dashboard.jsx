import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Button,
  List,
  Avatar,
  Tag,
} from "antd";
import { useAuth } from "../context/Auth/Auth.context";
import {
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import taskService from "../services/task.service";
import { TaskStatus } from "../constants/constant";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Kích hoạt plugin relativeTime
dayjs.extend(relativeTime);

const { Title } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy tasks (với limit nhỏ để lấy stats hoặc API stats riêng nếu có)
        // Ở đây tái sử dụng API getTasks và tính toán client-side tạm thời
        const res = await taskService.getTasks({ limit: 100 });
        if (res && res.metadata) {
          const tasks = res.metadata.tasks;
          setStats({
            total: res.metadata.pagination.total,
            todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
            in_progress: tasks.filter(
              (t) => t.status === TaskStatus.IN_PROGRESS
            ).length,
            done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
          });
          setRecentTasks(tasks.slice(0, 5));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      prefix: <Briefcase size={20} />,
      color: "#1677ff",
      bg: "rgba(22, 119, 255, 0.1)",
    },
    {
      title: "Pending",
      value: stats.todo,
      prefix: <Clock size={20} />,
      color: "#faad14",
      bg: "rgba(250, 173, 20, 0.1)",
    },
    {
      title: "In Progress",
      value: stats.in_progress,
      prefix: <TrendingUp size={20} />,
      color: "#52c41a",
      bg: "rgba(82, 196, 26, 0.1)",
    },
    {
      title: "Completed",
      value: stats.done,
      prefix: <CheckCircle2 size={20} />,
      color: "#722ed1",
      bg: "rgba(114, 46, 209, 0.1)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} style={{ margin: 0 }}>
          Executive Dashboard
        </Title>
        <span className="text-gray-500">
          Overview of performance and recent activities.
        </span>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              bordered={false}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title={
                  <span className="text-gray-500 font-medium">
                    {stat.title}
                  </span>
                }
                value={stat.value}
                loading={loading}
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Activity"
            bordered={false}
            className="shadow-sm h-full"
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={recentTasks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#1677ff" }}>
                        {item.title[0]}
                      </Avatar>
                    }
                    title={<a href={`#/tasks/${item.id}`}>{item.title}</a>}
                    description={`Created by ${
                      item.createdBy?.name || "Unknown"
                    } - ${dayjs(item.createdAt).fromNow()}`}
                  />
                  <Tag color={item.status === "done" ? "green" : "blue"}>
                    {item.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Team Performance"
            bordered={false}
            className="shadow-sm h-full"
          >
            <div className="flex items-center justify-center h-40 text-gray-400">
              Chart Placeholder
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
