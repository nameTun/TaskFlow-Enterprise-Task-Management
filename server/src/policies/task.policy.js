
import { ForbiddenError } from "../core/error.response.js";

/**
 * TASK POLICY
 * Định nghĩa quy tắc: AI được làm gì trên đối tượng Task.
 * Mô hình: Attribute-Based Access Control (ABAC)
 */
class TaskPolicy {
  
  /**
   * Tạo Filter MongoDB để giới hạn danh sách Task user được xem
   * @param {Object} user 
   */
  static getReadFilter(user) {
    // 1. ADMIN: GOD MODE - Xem tất cả
    // Trả về object rỗng {} để MongoDB không filter gì cả (trừ deletedAt: null đã có ở Controller)
    if (user.role === 'admin') {
      return {}; 
    }

    // 2. TEAM LEAD: Task cá nhân + Task Team do mình quản lý
    if (user.role === 'team_lead') {
      const conditions = [
        { createdBy: user._id },
        { assignedTo: user._id },
        { visibility: 'public' }
      ];
      // Nếu Lead có thuộc team nào đó thì xem được task của team đó
      if (user.teamId) {
        conditions.push({ teamId: user.teamId });
      }
      return { $or: conditions };
    }

    // 3. USER: Task cá nhân + Task được assign + Task được share
    return {
      $or: [
        { createdBy: user._id },
        { assignedTo: user._id },
        { sharedWith: user._id },
        // Mở rộng: Nếu User thuộc Team và task đó set visibility='team' (Giai đoạn 3)
        // { teamId: user.teamId, visibility: 'team' } 
      ]
    };
  }

  /**
   * Kiểm tra quyền xem chi tiết 1 Task
   */
  static canView(user, task) {
    // Admin xem được tất cả
    if (user.role === 'admin') return true;

    // Logic cho User/Lead
    // Lưu ý: Cần convert ObjectId sang String để so sánh chính xác
    const userIdStr = user._id.toString();
    const createdByStr = task.createdBy._id ? task.createdBy._id.toString() : task.createdBy.toString();
    const assignedToStr = task.assignedTo ? (task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo.toString()) : null;

    const isOwner = createdByStr === userIdStr;
    const isAssignee = assignedToStr === userIdStr;
    const isTeamTask = !!task.teamId;

    // Chủ sở hữu hoặc Người được giao luôn xem được
    if (isOwner || isAssignee) return true;
    
    // Nếu là Team Lead và task thuộc team mình quản lý
    if (user.role === 'team_lead' && isTeamTask && user.teamId) {
        if (user.teamId.toString() === task.teamId.toString()) return true;
    }

    // Nếu là thành viên team và task visibility là 'team' hoặc 'public' (Logic mở rộng)
    if (isTeamTask && user.teamId && user.teamId.toString() === task.teamId.toString()) {
         return true; // Tạm thời cho phép member xem task trong team
    }

    return false;
  }

  /**
   * Kiểm tra quyền cập nhật
   */
  static canUpdate(user, task) {
    // Admin sửa được tất cả
    if (user.role === 'admin') return true;

    const userIdStr = user._id.toString();
    const createdByStr = task.createdBy._id ? task.createdBy._id.toString() : task.createdBy.toString();
    const assignedToStr = task.assignedTo ? (task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo.toString()) : null;

    const isOwner = createdByStr === userIdStr;
    const isAssignee = assignedToStr === userIdStr;

    // Chủ task, Người được giao được sửa
    if (isOwner || isAssignee) return true;

    // Team Lead được sửa task trong team mình
    if (user.role === 'team_lead' && task.teamId && user.teamId) {
        if (user.teamId.toString() === task.teamId.toString()) return true;
    }

    return false;
  }

  /**
   * Kiểm tra quyền xóa
   */
  static canDelete(user, task) {
    // Admin xóa được tất cả
    if (user.role === 'admin') return true;

    const userIdStr = user._id.toString();
    const createdByStr = task.createdBy._id ? task.createdBy._id.toString() : task.createdBy.toString();
    const isOwner = createdByStr === userIdStr;
    const isTeamTask = !!task.teamId;

    // 1. Task cá nhân (Không thuộc team): Chỉ chủ nhân xóa
    if (!isTeamTask) return isOwner;

    // 2. Task Team: Lead (của team đó), Owner xóa
    if (isOwner) return true;
    
    if (user.role === 'team_lead' && user.teamId && task.teamId) {
        if (user.teamId.toString() === task.teamId.toString()) return true;
    }

    return false;
  }
}

// Helper bọc ngoài để ném lỗi nhanh
const ensure = (action, user, task) => {
  let allowed = false;
  switch (action) {
    case 'VIEW': allowed = TaskPolicy.canView(user, task); break;
    case 'UPDATE': allowed = TaskPolicy.canUpdate(user, task); break;
    case 'DELETE': allowed = TaskPolicy.canDelete(user, task); break;
  }

  if (!allowed) {
    throw new ForbiddenError(`Bạn không có quyền ${action} công việc này.`);
  }
};

export { TaskPolicy, ensure };
