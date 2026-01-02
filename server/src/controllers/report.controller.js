import { getDashboardStats } from "../services/report.service.js";
import { OK } from "../core/success.response.js";
import asyncHandler from "../helpers/asyncHandler.js";

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats(req.user);
  new OK({
    message: "Lấy dữ liệu Dashboard thành công",
    metadata: stats,
  }).send(res);
});
