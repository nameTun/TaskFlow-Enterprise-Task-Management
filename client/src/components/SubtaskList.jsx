import React, { useState } from "react";
import { List, Checkbox, Input, Button, Progress, message, Tooltip } from "antd";
import { Plus, Trash2 } from "lucide-react";
import taskService from "../services/task.service";

const SubtaskList = ({ task, onUpdate, onTaskUpdate }) => {
    const [subTaskTitle, setSubTaskTitle] = useState("");
    const [loading, setLoading] = useState(false);

    // Tính toán tiến độ
    const totalSubTasks = task.subTasks?.length || 0;
    const completedSubTasks =
        task.subTasks?.filter((st) => st.isCompleted).length || 0;
    const progressPercent =
        totalSubTasks === 0
            ? 0
            : Math.round((completedSubTasks / totalSubTasks) * 100);

    // Handler: Thêm Subtask
    const handleAddSubTask = async () => {
        if (!subTaskTitle.trim()) return;
        setLoading(true);
        try {
            const updated = await taskService.addSubTask(task._id || task.id, { title: subTaskTitle });
            message.success("Đã thêm việc nhỏ");
            setSubTaskTitle("");

            if (onTaskUpdate) {
                onTaskUpdate(updated);
            } else if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            message.error("Không thể thêm công việc");
        } finally {
            setLoading(false);
        }
    };

    // Handler: Toggle Hoàn thành
    const handleToggleSubTask = async (subTaskId, currentStatus) => {
        try {
            const updated = await taskService.updateSubTask(task._id || task.id, subTaskId, {
                isCompleted: !currentStatus,
            });

            if (onTaskUpdate) {
                onTaskUpdate(updated);
            } else if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            message.error("Không thể cập nhật trạng thái");
        }
    };

    // Handler: Xóa Subtask
    const handleDeleteSubTask = async (subTaskId) => {
        try {
            const updated = await taskService.deleteSubTask(task._id || task.id, subTaskId);
            message.success("Đã xóa việc nhỏ");
            if (onTaskUpdate) {
                onTaskUpdate(updated);
            } else if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            message.error("Không thể xóa công việc");
        }
    };

    return (
        <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Việc nhỏ (Checklist)</h4>

            {/* Progress Bar */}
            {totalSubTasks > 0 && (
                <Progress percent={progressPercent} size="small" className="mb-3" />
            )}

            {/* Input thêm mới */}
            <div className="flex gap-2 mb-3">
                <Input
                    placeholder="Thêm công việc nhỏ..."
                    value={subTaskTitle}
                    onChange={(e) => setSubTaskTitle(e.target.value)}
                    onPressEnter={handleAddSubTask}
                    disabled={loading}
                />
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={handleAddSubTask}
                    loading={loading}
                >
                    Thêm
                </Button>
            </div>

            {/* Danh sách Subtask */}
            <List
                size="small"
                bordered
                dataSource={task.subTasks || []}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    danger
                                    icon={<Trash2 size={16} />}
                                    onClick={() => handleDeleteSubTask(item._id)}
                                />
                            </Tooltip>,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                <Checkbox
                                    checked={item.isCompleted}
                                    onChange={() => handleToggleSubTask(item._id, item.isCompleted)}
                                />
                            }
                            title={
                                <span
                                    style={{
                                        textDecoration: item.isCompleted ? "line-through" : "none",
                                        color: item.isCompleted ? "#888" : "inherit",
                                    }}
                                >
                                    {item.title}
                                </span>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default SubtaskList;
