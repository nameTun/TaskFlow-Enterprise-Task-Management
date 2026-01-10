import React, { useState, useEffect } from "react";
import { Timeline, Typography, Spin, Avatar } from "antd";
import {
    FilePlus,
    CheckCircle,
    AlertTriangle,
    UserPlus,
    MessageSquare,
    Clock,
    Edit3,
} from "lucide-react";
import activityLogService from "../services/activity-log.service";
import dayjs from "dayjs";

const { Text } = Typography;

const ActivityTimeline = ({ taskId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (taskId) {
            setLoading(true);
            activityLogService
                .getLogs(taskId)
                .then((res) => {
                    if (res && res.metadata) {
                        setLogs(res.metadata);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [taskId]);

    const getIcon = (action) => {
        switch (action) {
            case "CREATE_TASK":
                return <FilePlus size={16} className="text-blue-500" />;
            case "UPDATE_STATUS":
                return <CheckCircle size={16} className="text-green-500" />;
            case "UPDATE_PRIORITY":
                return <AlertTriangle size={16} className="text-orange-500" />;
            case "ASSIGN_USER":
                return <UserPlus size={16} className="text-purple-500" />;
            case "COMMENT":
                return <MessageSquare size={16} className="text-gray-500" />;
            case "UPDATE_DEADLINE":
                return <Clock size={16} className="text-red-500" />;
            default:
                return <Edit3 size={16} className="text-gray-400" />;
        }
    };

    const formatContent = (log) => {
        const { action, content, actor } = log;
        const actorName = <Text strong>{actor?.name}</Text>;

        switch (action) {
            case "CREATE_TASK":
                return <span>{actorName} created the task.</span>;
            case "UPDATE_STATUS":
                return (
                    <span>
                        {actorName} changed status from <Text code>{content.from}</Text> to{" "}
                        <Text code>{content.to}</Text>.
                    </span>
                );
            case "UPDATE_PRIORITY":
                return (
                    <span>
                        {actorName} changed priority from <Text code>{content.from}</Text>{" "}
                        to <Text code>{content.to}</Text>.
                    </span>
                );
            case "ASSIGN_USER":
                return <span>{actorName} updated the assignee.</span>;
            case "COMMENT":
                return <span>{actorName} commented on the task.</span>;
            default:
                return <span>{actorName} updated the task.</span>;
        }
    };

    if (loading) return <Spin className="flex justify-center my-4" />;

    if (logs.length === 0) {
        return <div className="text-center text-gray-400 my-4">No activity yet</div>;
    }

    return (
        <div className="mt-4 px-2">
            <Timeline
                items={logs.map((log) => ({
                    dot: getIcon(log.action),
                    children: (
                        <div className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="text-sm">{formatContent(log)}</div>
                                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                    {dayjs(log.createdAt).format("MMM D, HH:mm")}
                                </div>
                            </div>
                        </div>
                    ),
                }))}
            />
        </div>
    );
};

export default ActivityTimeline;
