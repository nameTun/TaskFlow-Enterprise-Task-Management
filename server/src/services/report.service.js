import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";

export const getDashboardStats = async (user) => {
  const role = user.role;
  // startOfToday: Lấy thời điểm 00:00:00 hôm nay
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // --- 1. ADMIN DASHBOARD ---
  if (role === "admin") {
    const [totalUsers, totalTeams, totalTasks, newUsersToday] =
      await Promise.all([
        User.countDocuments({ deletedAt: null }),
        Team.countDocuments({ deletedAt: null }),
        Task.countDocuments({ deletedAt: null }),
        User.countDocuments({ createdAt: { $gte: startOfToday } }),
      ]);

    // Thống kê task theo trạng thái toàn hệ thống
    const taskStats = await Task.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statsMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
    taskStats.forEach((s) => (statsMap[s._id] = s.count));

    return {
      type: "admin",
      cards: {
        totalUsers,
        totalTeams,
        totalTasks,
        newUsersToday,
      },
      chartData: statsMap,
    };
  }

  // --- 2. TEAM LEAD DASHBOARD ---
  if (role === "team_lead") {
    if (!user.teamId) {
      return { type: "team_lead", hasTeam: false };
    }

    // Convert string ID sang ObjectId để Aggregation hoạt động chính xác
    const teamId = new mongoose.Types.ObjectId(user.teamId);

    // Thống kê task của team
    const teamTasks = await Task.aggregate([
      { $match: { teamId: teamId, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statsMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
    let totalTeamTasks = 0;
    teamTasks.forEach((s) => {
      statsMap[s._id] = s.count;
      totalTeamTasks += s.count;
    });

    // Thống kê workload
    const memberWorkload = await Task.aggregate([
      {
        $match: {
          teamId: teamId,
          status: { $in: ["todo", "in_progress"] },
          deletedAt: null,
        },
      },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    await User.populate(memberWorkload, {
      path: "_id",
      select: "name avatar email",
    });

    // Task quá hạn (nhỏ hơn hôm nay)
    const overdueTasks = await Task.countDocuments({
      teamId: teamId,
      dueDate: { $lt: startOfToday }, // So với đầu ngày hôm nay
      status: { $ne: "done" },
      deletedAt: null,
    });

    return {
      type: "team_lead",
      hasTeam: true,
      cards: {
        totalTeamTasks,
        pendingTasks: statsMap.todo + statsMap.in_progress,
        completedTasks: statsMap.done,
        overdueTasks,
      },
      taskDistribution: statsMap,
      memberWorkload: memberWorkload.map((m) => ({
        user: m._id,
        count: m.count,
      })),
    };
  }

  // --- 3. USER DASHBOARD ---
  // Convert User ID
  const userId = new mongoose.Types.ObjectId(user._id);

  const myTasks = await Task.aggregate([
    { $match: { assignedTo: userId, deletedAt: null } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const statsMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
  let totalMyTasks = 0;

  if (myTasks.length > 0) {
    myTasks.forEach((s) => {
      statsMap[s._id] = s.count;
      totalMyTasks += s.count;
    });
  }

  // Task sắp đến hạn (trong 3 ngày tới, bao gồm cả hôm nay)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const upcomingTasks = await Task.find({
    assignedTo: userId,
    // Lấy từ đầu ngày hôm nay trở đi để không bị sót task trong ngày
    dueDate: { $gte: startOfToday, $lte: threeDaysFromNow },
    status: { $ne: "done" },
    deletedAt: null,
  })
    .select("title dueDate priority")
    .sort({ dueDate: 1 })
    .limit(5);

  return {
    type: "user",
    cards: {
      totalMyTasks,
      inProgress: statsMap.in_progress,
      completed: statsMap.done,
      pending: statsMap.todo,
    },
    upcomingTasks,
  };
};



