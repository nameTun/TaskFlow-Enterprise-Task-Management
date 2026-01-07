import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  List,
  Avatar,
  Tag,
  Progress,
  Button,
  Empty,
  Skeleton,
  Space
} from "antd";
import { useAuth } from "../context/Auth/Auth.context";
import {
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Calendar,
  Shield,
} from "lucide-react";
import reportService from "../services/report.service";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reportService.getDashboardStats();
        if (response && response.metadata) {
          setData(response.metadata);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;

  // --- RENDER FOR ADMIN ---
  if (data?.type === "admin") {
    const { cards, chartData } = data;
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-purple-600" />
            <Title level={2} style={{ margin: 0 }}>
              System Overview
            </Title>
          </div>
          <Text type="secondary">
            Welcome back, Admin. Here is the system health report.
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Users"
                value={cards.totalUsers}
                prefix={<Users size={20} className="text-blue-500 mr-2" />}
              />
              <div className="text-xs text-green-500 mt-2">
                +{cards.newUsersToday} new today
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Teams"
                value={cards.totalTeams}
                prefix={
                  <Briefcase size={20} className="text-indigo-500 mr-2" />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Tasks"
                value={cards.totalTasks}
                prefix={
                  <CheckCircle2 size={20} className="text-green-500 mr-2" />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="shadow-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
            >
              <div className="text-white/80 text-sm mb-1">System Status</div>
              <div className="text-2xl font-bold">Healthy</div>
              <div className="text-xs text-white/70 mt-2">
                All services operational
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title="Task Distribution (Global)"
              bordered={false}
              className="shadow-sm"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>To Do</span>
                    <span>{chartData.todo}</span>
                  </div>
                  <Progress
                    percent={
                      Math.round((chartData.todo / cards.totalTasks) * 100) || 0
                    }
                    status="active"
                    strokeColor="#faad14"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>In Progress</span>
                    <span>{chartData.in_progress}</span>
                  </div>
                  <Progress
                    percent={
                      Math.round(
                        (chartData.in_progress / cards.totalTasks) * 100
                      ) || 0
                    }
                    status="active"
                    strokeColor="#1677ff"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Done</span>
                    <span>{chartData.done}</span>
                  </div>
                  <Progress
                    percent={
                      Math.round((chartData.done / cards.totalTasks) * 100) || 0
                    }
                    status="success"
                    strokeColor="#52c41a"
                  />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Quick Actions"
              bordered={false}
              className="shadow-sm h-full"
            >
              <Space direction="vertical" className="w-full">
                <Button type="primary" block onClick={() => navigate("/users")}>
                  Manage Users
                </Button>
                <Button block onClick={() => navigate("/settings")}>
                  System Settings
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // --- RENDER FOR TEAM LEAD ---
  if (data?.type === "team_lead") {
    if (!data.hasTeam) {
      return (
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          imageStyle={{ height: 150 }}
          description={
            <span className="text-gray-500">
              You are a Team Lead but haven't created a team yet.
            </span>
          }
        >
          <Button type="primary" onClick={() => navigate("/team")}>
            Create Team Now
          </Button>
        </Empty>
      );
    }

    const { cards, taskDistribution, memberWorkload } = data;
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Team Overview
          </Title>
          <Text type="secondary">Performance metrics for your team.</Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Active Tasks"
                value={cards.pendingTasks}
                suffix={`/ ${cards.totalTeamTasks}`}
                prefix={<TrendingUp size={20} className="text-blue-500 mr-2" />}
              />
              <Progress
                percent={
                  Math.round(
                    (cards.pendingTasks / cards.totalTeamTasks) * 100
                  ) || 0
                }
                showInfo={false}
                size="small"
                className="mt-2"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Completed"
                value={cards.completedTasks}
                valueStyle={{ color: "#3f8600" }}
                prefix={<CheckCircle2 size={20} className="mr-2" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Overdue"
                value={cards.overdueTasks}
                valueStyle={{ color: "#cf1322" }}
                prefix={<AlertCircle size={20} className="mr-2" />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title="Member Workload (Active Tasks)"
              bordered={false}
              className="shadow-sm"
            >
              <List
                itemLayout="horizontal"
                dataSource={memberWorkload}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar src={item.user?.avatar}>
                          {item.user?.name?.[0]}
                        </Avatar>
                      }
                      title={item.user?.name}
                      description={item.user?.email}
                    />
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">{item.count}</div>
                        <div className="text-xs text-gray-400">Tasks</div>
                      </div>
                      {item.count > 5 && <Tag color="orange">High Load</Tag>}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title="Task Status"
              bordered={false}
              className="shadow-sm h-full"
            >
              <div className="space-y-6 mt-2">
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={
                      Math.round(
                        (taskDistribution.done / cards.totalTeamTasks) * 100
                      ) || 0
                    }
                  />
                  <div className="mt-2 text-gray-500">Completion Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-orange-500 font-bold text-xl">
                      {taskDistribution.todo}
                    </div>
                    <div className="text-xs text-gray-500">To Do</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-blue-500 font-bold text-xl">
                      {taskDistribution.in_progress}
                    </div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // --- RENDER FOR USER (DEFAULT) ---
  const { cards, upcomingTasks } = data;
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            My Workspace
          </Title>
          <Text type="secondary">Track your personal progress.</Text>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold text-blue-600">
            {dayjs().format("dddd")}
          </div>
          <div className="text-gray-500">{dayjs().format("DD MMMM, YYYY")}</div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            className="shadow-sm bg-blue-50 dark:bg-blue-900/20"
          >
            <Statistic
              title="In Progress"
              value={cards.inProgress}
              prefix={<Clock size={20} className="text-blue-600 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            className="shadow-sm bg-green-50 dark:bg-green-900/20"
          >
            <Statistic
              title="Completed"
              value={cards.completed}
              prefix={
                <CheckCircle2 size={20} className="text-green-600 mr-2" />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            className="shadow-sm bg-gray-50 dark:bg-gray-800"
          >
            <Statistic
              title="Pending"
              value={cards.pending}
              prefix={<Briefcase size={20} className="text-gray-500 mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <Calendar size={18} /> Upcoming Deadlines (3 Days)
              </div>
            }
            bordered={false}
            className="shadow-sm h-full"
          >
            <List
              dataSource={upcomingTasks}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tag
                      color={
                        dayjs(item.dueDate).diff(dayjs(), "day") === 0
                          ? "red"
                          : "orange"
                      }
                    >
                      {dayjs(item.dueDate).fromNow()}
                    </Tag>,
                  ]}
                  onClick={() => navigate(`/tasks/${item._id}`)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors px-2 rounded-lg"
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        className={`w-2 h-2 rounded-full mt-2.5 ${
                          item.priority === "high"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                    }
                    title={item.title}
                    description={dayjs(item.dueDate).format(
                      "HH:mm - DD/MM/YYYY"
                    )}
                  />
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <Empty description="No upcoming deadlines. You are free!" />
                ),
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="My Productivity"
            bordered={false}
            className="shadow-sm h-full"
          >
            <div className="flex flex-col items-center justify-center py-6">
              <Progress
                type="dashboard"
                percent={
                  Math.round((cards.completed / cards.totalMyTasks) * 100) || 0
                }
                gapDegree={30}
              />
              <div className="mt-4 text-center">
                <div className="text-gray-500">Total Assigned</div>
                <div className="text-2xl font-bold">{cards.totalMyTasks}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
