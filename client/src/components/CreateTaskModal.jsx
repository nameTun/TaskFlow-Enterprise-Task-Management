import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Row,
  Col,
  Avatar,
  Radio,
  Space
} from "antd";
import {
  TaskStatus,
  TaskStatusLabels,
  TaskPriority,
  TaskPriorityLabels,
} from "../constants/constant";
import taskService from "../services/task.service";
import teamService from "../services/team.service";
import dayjs from "dayjs";
import { Users, Lock } from "lucide-react";

const { Option } = Select;
const { TextArea } = Input;

const CreateTaskModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [hasTeam, setHasTeam] = useState(false);

  // Load team members khi modal mở
  useEffect(() => {
    if (open) {
      const fetchMembers = async () => {
        try {
          const res = await teamService.getMyTeam();
          if (res && res.metadata) {
            setHasTeam(true);
            // Default visibility thành 'team' nếu user có team
            form.setFieldValue("visibility", "team");

            if (res.metadata.members) {
              setTeamMembers(res.metadata.members);
            }
          } else {
            setHasTeam(false);
            form.setFieldValue("visibility", "private");
          }
        } catch (error) {
          setHasTeam(false);
        }
      };
      fetchMembers();
    }
  }, [open, form]);

  const handleFinish = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        assignedTo: values.assignedTo,
        visibility: values.visibility, // Gửi visibility lên server
      };

      await taskService.createTask(payload);

      message.success("Tạo công việc mới thành công!");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        "Không thể tạo công việc. Vui lòng thử lại.";
      message.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo Công Việc Mới"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TODO,
          startDate: dayjs(),
          visibility: "private", // Default fallback
        }}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề công việc" },
                { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự" },
              ]}
            >
              <Input
                placeholder="Ví dụ: Hoàn thành báo cáo tài chính Q3"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="assignedTo" label="Giao cho (Trong Team)">
              <Select
                placeholder="Chọn thành viên"
                allowClear
                disabled={!hasTeam}
              >
                {teamMembers.map((member) => (
                  <Option key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <Avatar size="small" src={member.avatar}>
                        {member.name?.[0]}
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </Option>
                ))}
              </Select>
              {!hasTeam && (
                <div className="text-xs text-gray-400 mt-1">
                  Bạn cần gia nhập Team để giao việc.
                </div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="priority" label="Mức độ ưu tiên">
              <Select>
                {Object.values(TaskPriority).map((p) => (
                  <Option key={p} value={p}>
                    {TaskPriorityLabels[p]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="startDate" label="Ngày bắt đầu">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                showTime={{ format: "HH:mm" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="Hạn hoàn thành"
              rules={[
                {
                  validator: (_, value) => {
                    if (value && value.isBefore(dayjs())) {
                      return Promise.reject(
                        new Error(
                          "Hạn hoàn thành phải lớn hơn thời điểm hiện tại"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                showTime={{ format: "HH:mm" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="Trạng thái ban đầu">
              <Select>
                {Object.values(TaskStatus).map((s) => (
                  <Option key={s} value={s}>
                    {TaskStatusLabels[s]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="visibility" label="Quyền riêng tư">
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="private">
                  <Space size="small">
                    <Lock size={14} /> Riêng tư
                  </Space>
                </Radio.Button>
                <Radio.Button value="team" disabled={!hasTeam}>
                  <Space size="small">
                    <Users size={14} /> Team
                  </Space>
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả chi tiết">
          <TextArea
            rows={4}
            placeholder="Mô tả chi tiết về công việc cần làm..."
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onCancel} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Tạo công việc
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
