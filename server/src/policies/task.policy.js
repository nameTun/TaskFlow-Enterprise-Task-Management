
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
    if (user.role === 'admin') {
      return {}; 
    }

    // 2. TEAM LEAD: Xem hết task của Team mình + Task cá nhân
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

    // 3. USER (Member): 
    // - Task mình tạo
    // - Task được giao
    // - Task được share trực tiếp
    // - Task thuộc Team mình VÀ có visibility là 'team' hoặc 'public'
    const conditions = [
        { createdBy: user._id },
        { assignedTo: user._id },
        { sharedWith: user._id }
    ];

    if (user.teamId) {
        conditions.push({ 
            teamId: user.teamId, 
            visibility: { $in: ['team', 'public'] } 
        });
    }

    return { $or: conditions };
  }

  /**
   * Kiểm tra quyền xem chi tiết 1 Task
   */
  static canView(user, task) {
    if (user.role === 'admin') return true;

    const userIdStr = user._id.toString();
    const createdByStr = task.createdBy._id ? task.createdBy._id.toString() : task.createdBy.toString();
    const assignedToStr = task.assignedTo ? (task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo.toString()) : null;

    // Chủ sở hữu hoặc Người được giao luôn xem được
    if (createdByStr === userIdStr || assignedToStr === userIdStr) return true;
    
    // Check Shared With (Mảng ID)
    if (task.sharedWith && task.sharedWith.some(id => id.toString() === userIdStr)) return true;

    const isTeamTask = !!task.teamId;
    
    // Nếu User thuộc Team và Task thuộc Team
    if (isTeamTask && user.teamId && task.teamId) {
        const userTeamIdStr = user.teamId.toString();
        const taskTeamIdStr = task.teamId.toString();

        if (userTeamIdStr === taskTeamIdStr) {
             // Team Lead xem được hết
             if (user.role === 'team_lead') return true;
             // Member xem được nếu visibility là team/public
             if (['team', 'public'].includes(task.visibility)) return true;
        }
    }

    return false;
  }

  /**
   * Kiểm tra quyền cập nhật
   */
  static canUpdate(user, task) {
    if (user.role === 'admin') return true;

    const userIdStr = user._id.toString();
    const createdByStr = task.createdBy._id ? task.createdBy._id.toString() : task.createdBy.toString();
    const assignedToStr = task.assignedTo ? (task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo.toString()) : null;

    // Chủ task, Người được giao được sửa
    if (createdByStr === userIdStr || assignedToStr === userIdStr) return true;

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
    if (user.role === 'admin') return true;

    const userIdStr = user._id.toString();
    const createdByStr = task.createdBy._id ? task.createdBy._id.toString() : task.createdBy.toString();
    const isTeamTask = !!task.teamId;

    // 1. Task cá nhân (Không thuộc team): Chỉ chủ nhân xóa
    if (!isTeamTask) return createdByStr === userIdStr;

    // 2. Task Team: Lead (của team đó) hoặc Owner xóa
    if (createdByStr === userIdStr) return true;
    
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
