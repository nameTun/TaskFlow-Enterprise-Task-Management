import React, { useState, useEffect } from "react";
import { List, Avatar, Input, Button, message, Popconfirm, Typography } from "antd";
import { Send, Trash2 } from "lucide-react";
import commentService from "../services/comment.service";
import { useAuth } from "../context/Auth/Auth.context";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const CommentSection = ({ taskId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [content, setContent] = useState("");

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await commentService.getComments(taskId);
            if (res && res.metadata) {
                setComments(res.metadata);
            }
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchComments();
        }
    }, [taskId]);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        try {
            setSubmitting(true);
            const res = await commentService.createComment(taskId, content);
            if (res && res.metadata) {
                setComments((prev) => [res.metadata, ...prev]);
                setContent("");
                message.success("Comment added");
            }
        } catch (error) {
            message.error("Failed to add comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await commentService.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            message.success("Comment deleted");
        } catch (error) {
            message.error("Failed to delete comment");
        }
    };

    return (
        <div className="mt-4">
            {/* Input Section */}
            <div className="flex gap-3 mb-6">
                <Avatar src={user?.avatar}>{user?.name?.[0]}</Avatar>
                <div className="flex-1">
                    <Input.TextArea
                        rows={2}
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={submitting}
                    />
                    <div className="flex justify-end mt-2">
                        <Button
                            type="primary"
                            icon={<Send size={16} />}
                            onClick={handleSubmit}
                            loading={submitting}
                            disabled={!content.trim()}
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </div>

            {/* Connection Line */}
            {/* Comments List */}
            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={(item) => (
                    <List.Item
                        actions={
                            user?._id === item.user?.id
                                ? [
                                    <Popconfirm
                                        title="Delete this comment?"
                                        onConfirm={() => handleDelete(item._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<Trash2 size={14} />}
                                        />
                                    </Popconfirm>,
                                ]
                                : []
                        }
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar src={item.user?.avatar}>{item.user?.name?.[0]}</Avatar>
                            }
                            title={
                                <div className="flex justify-between items-center">
                                    <Text strong>{item.user?.name || "Unknown User"}</Text>
                                    <Text type="secondary" className="text-xs">
                                        {dayjs(item.createdAt).fromNow()}
                                    </Text>
                                </div>
                            }
                            description={
                                <div className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                                    {item.content}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default CommentSection;
