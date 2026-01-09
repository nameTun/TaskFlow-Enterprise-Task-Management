import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  TaskStatus,
  TaskStatusLabels,
  TaskPriority,
  TaskPriorityLabels,
} from "../constants/constant";
import taskService from "../services/task.service";
import dayjs from "dayjs";
import SubtaskList from "./SubtaskList";

const { Option } = Select;
const { TextArea } = Input;

const EditTaskModal = ({ open, onCancel, onSuccess, task }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState(task);

  // Effect: Mỗi khi Modal mở ra hoặc task thay đổi từ props, cập nhật state nội bộ
  useEffect(() => {
    if (open && task) {
      setCurrentTask(task);
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        startDate: task.startDate ? dayjs(task.startDate) : null,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      });
    }
  }, [open, task, form]);

  // Hàm refresh task để cập nhật Subtask list mới nhất
  const refreshTask = async () => {
    try {
      const updated = await taskService.getTaskById(currentTask._id || currentTask.id);
      if (updated && updated.metadata) {
        setCurrentTask(updated.metadata);
      }
      // Nếu muốn danh sách ngoài Dashboard cũng cập nhật realtime số lượng subtask completed,
      // ta có thể gọi onSuccess() nhưng nó sẽ reload cả bảng, có thể gây lag.
      // Tạm thời chỉ update nội bộ modal.
    } catch (error) {
      console.error("Failed to refresh task", error);
    }
  };

  const handleFinish = async (values) => {
    setIsLoading(true);
    try {
      // Chuẩn bị payload
      const payload = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };

      // Gọi API Update
      // Chú ý: task._id hoặc task.id tùy thuộc vào dữ liệu trả về
      await taskService.updateTask(task._id || task.id, payload);

      message.success("Cập nhật công việc thành công!");
      if (onSuccess) onSuccess(); // Callback để refresh dữ liệu ở trang cha
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message || "Không thể cập nhật công việc.";
      message.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh Sửa Công Việc"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
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
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
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
          <Col span={12}>
            <Form.Item name="status" label="Trạng thái">
              <Select>
                {Object.values(TaskStatus).map((s) => (
                  <Option key={s} value={s}>
                    {TaskStatusLabels[s]}
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
            // Lưu ý: Không validate strict "lớn hơn hiện tại" ở đây
            // vì user có thể sửa title của một task đã quá hạn mà không muốn đổi ngày.
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                showTime={{ format: "HH:mm" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả chi tiết">
          <TextArea rows={6} placeholder="Mô tả chi tiết..." />
        </Form.Item>

        {/* SUBTASKS SECTION */}
        {currentTask && (
          <SubtaskList task={currentTask} onUpdate={refreshTask} />
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onCancel} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
