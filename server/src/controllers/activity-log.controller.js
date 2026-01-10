import ActivityLogService from "../services/activity-log.service.js";
import ActivityLogDto from "../dtos/activity-log.dto.js";
import { OK } from "../core/success.response.js";
import asyncHandler from "../helpers/asyncHandler.js";

const getLogs = asyncHandler(async (req, res) => {
    const logs = await ActivityLogService.getLogsByTask(req.params.taskId);
    const logsDto = logs.map(l => new ActivityLogDto(l));

    new OK({
        message: "Get activity logs success",
        metadata: logsDto
    }).send(res);
});

export default {
    getLogs
};
