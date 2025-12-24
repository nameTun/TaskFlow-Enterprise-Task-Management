// import React from "react";
// import {
//   Card,
//   Statistic,
//   Table,
//   Tag,
//   Input,
//   Button,
//   Space,
//   Typography,
//   Row,
//   Col,
// } from "antd";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/Auth/Auth.context";
// import {
//   Briefcase,
//   Clock,
//   Users,
//   CheckCircle2,
//   Plus,
//   Search,
// } from "lucide-react";
// import { TaskStatus, TaskPriority } from "../constants/constant";

// const { Title } = Typography;

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth(); // Lấy thông tin user từ context

//   // Mock Data (Sẽ thay bằng API sau)
//   const stats = [
//     {
//       title: "Total Tasks",
//       value: 1240,
//       prefix: <Briefcase size={20} />,
//       color: "#1677ff",
//       bg: "rgba(22, 119, 255, 0.1)",
//     },
//     {
//       title: "Pending",
//       value: 340,
//       prefix: <Clock size={20} />,
//       color: "#faad14",
//       bg: "rgba(250, 173, 20, 0.1)",
//     },
//     {
//       title: "Active Users",
//       value: 45,
//       prefix: <Users size={20} />,
//       color: "#52c41a",
//       bg: "rgba(82, 196, 26, 0.1)",
//     },
//     {
//       title: "Completed Today",
//       value: 12,
//       prefix: <CheckCircle2 size={20} />,
//       color: "#722ed1",
//       bg: "rgba(114, 46, 209, 0.1)",
//     },
//   ];

//   const dataSource = [
//     {
//       key: "1",
//       id: "TASK-2048",
//       title: "Q3 Financial Report",
//       dept: "Finance",
//       user: "Jane Doe",
//       date: "2023-10-24",
//       priority: TaskPriority.HIGH,
//       status: TaskStatus.TODO,
//     },
//     {
//       key: "2",
//       id: "TASK-2049",
//       title: "Update Homepage",
//       dept: "Marketing",
//       user: "Mark Smith",
//       date: "2023-10-26",
//       priority: TaskPriority.MEDIUM,
//       status: TaskStatus.IN_PROGRESS,
//     },
//     {
//       key: "3",
//       id: "TASK-2050",
//       title: "Server Maintenance",
//       dept: "DevOps",
//       user: "Alex Johnson",
//       date: "2023-10-22",
//       priority: TaskPriority.LOW,
//       status: TaskStatus.DONE,
//     },
//     {
//       key: "4",
//       id: "TASK-2051",
//       title: "Client Onboarding",
//       dept: "Sales",
//       user: "Sarah Lee",
//       date: "2023-11-01",
//       priority: TaskPriority.HIGH,
//       status: TaskStatus.TODO,
//     },
//   ];

//   const columns = [
//     {
//       title: "Task Info",
//       dataIndex: "title",
//       key: "title",
//       fixed: "left", // Ghim cột này khi scroll
//       width: 250,
//       render: (text, record) => (
//         <div>
//           <div className="font-medium truncate">{text}</div>
//           <div className="text-xs text-gray-400">
//             {record.id} • {record.dept}
//           </div>
//         </div>
//       ),
//     },
//     { title: "Assignee", dataIndex: "user", key: "user", width: 150 },
//     { title: "Due Date", dataIndex: "date", key: "date", width: 120 },
//     {
//       title: "Priority",
//       dataIndex: "priority",
//       key: "priority",
//       width: 100,
//       render: (priority) => {
//         let color = "default";
//         if (priority === TaskPriority.HIGH) color = "red";
//         if (priority === TaskPriority.MEDIUM) color = "orange";
//         return <Tag color={color}>{priority}</Tag>;
//       },
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       width: 120,
//       render: (status) => {
//         let color = "default";
//         if (status === TaskStatus.DONE) color = "green";
//         if (status === TaskStatus.IN_PROGRESS) color = "blue";
//         return <Tag color={color}>{status}</Tag>;
//       },
//     },
//     {
//       title: "Action",
//       key: "action",
//       width: 80,
//       fixed: "right",
//       render: (_, record) => (
//         <Space size="middle">
//           <Button
//             type="link"
//             size="small"
//             onClick={() => navigate(`/tasks/${record.id}`)}
//           >
//             View
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <Title level={2} style={{ margin: 0 }}>
//             Dashboard
//           </Title>
//           <span className="text-gray-500">
//             Welcome back,{" "}
//             <strong>{user?.name || user?.fullName || "User"}</strong>! Here is
//             your workspace activity.
//           </span>
//         </div>
//         <Button
//           type="primary"
//           icon={<Plus size={16} />}
//           size="large"
//           className="w-full md:w-auto"
//         >
//           New Task
//         </Button>
//       </div>

//       <Row gutter={[16, 16]}>
//         {stats.map((stat, idx) => (
//           <Col xs={24} sm={12} lg={6} key={idx}>
//             <Card
//               bordered={false}
//               className="shadow-sm hover:shadow-md transition-shadow h-full"
//             >
//               <Statistic
//                 title={
//                   <span className="text-gray-500 font-medium">
//                     {stat.title}
//                   </span>
//                 }
//                 value={stat.value}
//                 prefix={
//                   <div
//                     style={{ color: stat.color, backgroundColor: stat.bg }}
//                     className="p-2 rounded-lg mr-2 flex items-center justify-center"
//                   >
//                     {stat.prefix}
//                   </div>
//                 }
//                 valueStyle={{ fontWeight: "bold" }}
//               />
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       <Card
//         title="Recent Tasks"
//         bordered={false}
//         className="shadow-sm"
//         extra={
//           <Input
//             placeholder="Search tasks..."
//             prefix={<Search size={16} className="text-gray-400" />}
//             className="w-full md:w-[200px]"
//           />
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={dataSource}
//           pagination={{ pageSize: 5 }}
//           scroll={{ x: 800 }}
//           onRow={(record) => ({
//             onClick: () => navigate(`/tasks/${record.id}`),
//             style: { cursor: "pointer" },
//           })}
//         />
//       </Card>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState } from "react";
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
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth/Auth.context";
import {
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  Plus,
  Search,
} from "lucide-react";
import {
  TaskStatus,
  TaskPriority,
  TaskStatusLabels,
  TaskPriorityLabels,
} from "../constants/constant";
import CreateTaskModal from "../components/CreateTaskModal";

const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State quản lý Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock Data (Sẽ thay bằng API sau)
  const stats = [
    {
      title: "Total Tasks",
      value: 1240,
      prefix: <Briefcase size={20} />,
      color: "#1677ff",
      bg: "rgba(22, 119, 255, 0.1)",
    },
    {
      title: "Pending",
      value: 340,
      prefix: <Clock size={20} />,
      color: "#faad14",
      bg: "rgba(250, 173, 20, 0.1)",
    },
    {
      title: "Active Users",
      value: 45,
      prefix: <Users size={20} />,
      color: "#52c41a",
      bg: "rgba(82, 196, 26, 0.1)",
    },
    {
      title: "Completed Today",
      value: 12,
      prefix: <CheckCircle2 size={20} />,
      color: "#722ed1",
      bg: "rgba(114, 46, 209, 0.1)",
    },
  ];

  const dataSource = [
    {
      key: "1",
      id: "TASK-2048",
      title: "Q3 Financial Report",
      dept: "Finance",
      user: "Jane Doe",
      date: "2023-10-24",
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
    },
    {
      key: "2",
      id: "TASK-2049",
      title: "Update Homepage",
      dept: "Marketing",
      user: "Mark Smith",
      date: "2023-10-26",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
    },
    {
      key: "3",
      id: "TASK-2050",
      title: "Server Maintenance",
      dept: "DevOps",
      user: "Alex Johnson",
      date: "2023-10-22",
      priority: TaskPriority.LOW,
      status: TaskStatus.DONE,
    },
    {
      key: "4",
      id: "TASK-2051",
      title: "Client Onboarding",
      dept: "Sales",
      user: "Sarah Lee",
      date: "2023-11-01",
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
    },
  ];

  const columns = [
    {
      title: "Task Info",
      dataIndex: "title",
      key: "title",
      fixed: "left", // Ghim cột này khi scroll
      width: 250,
      render: (text, record) => (
        <div>
          <div className="font-medium truncate">{text}</div>
          <div className="text-xs text-gray-400">
            {record.id} • {record.dept}
          </div>
        </div>
      ),
    },
    { title: "Assignee", dataIndex: "user", key: "user", width: 150 },
    { title: "Due Date", dataIndex: "date", key: "date", width: 120 },
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

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    // TODO: Khi nào implement xong GET API, gọi hàm fetchTasks() ở đây để reload bảng
    console.log("Task created, should refresh table");
  };

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

      <Card
        title="Recent Tasks"
        bordered={false}
        className="shadow-sm"
        extra={
          <Input
            placeholder="Search tasks..."
            prefix={<Search size={16} className="text-gray-400" />}
            className="w-full md:w-[200px]"
          />
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 5 }}
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
