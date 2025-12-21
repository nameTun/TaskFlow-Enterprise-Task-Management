/**
 * @desc Xóa một mục công việc bằng ID của nó.
 * @param {string} id ID của todo cần xóa.
 * @param {string} userId ID của người dùng thực hiện xóa.
 * @param {string} userRole Vai trò của người dùng.
 * @returns {object} Todo đã bị xóa.
 */
export const deleteTodo = async (id, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new TodoError('ID Todo không hợp lệ.', 400);
  }

  let findQuery = { _id: id };

  if (userRole === 'Admin') {
    // Admin có thể xóa bất kỳ todo nào
  } else if (userRole === 'User') {
    // User chỉ có thể xóa todo do họ tạo HOẶC được giao cho họ
    findQuery.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  } else if (userRole === 'Team Lead') {
    // Team Lead có thể xóa todo do họ tạo HOẶC do thành viên trong nhóm của họ tạo
    const team = await Team.findOne({ leadId: userId });
    let allowedCreatorIds = [userId];

    if (team && team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      allowedCreatorIds = allowedCreatorIds.concat(memberIds);
    }
    findQuery.createdBy = { $in: allowedCreatorIds };
  } else {
    throw new TodoError('Bạn không có quyền xóa todo này.', 403);
  }

  const deletedTodo = await Todo.findOneAndDelete(findQuery);

  if (!deletedTodo) {
    throw new TodoError('Không tìm thấy Todo hoặc người dùng không có quyền.', 404);
  }
  return deletedTodo;
};

/**
 * @desc Cập nhật một mục công việc hiện có.
 * @param {string} id ID của todo cần cập nhật.
 * @param {object} updates Dữ liệu cần cập nhật.
 * @param {string} userId ID của người dùng thực hiện cập nhật.
 * @param {string} userRole Vai trò của người dùng.
 * @returns {object} Todo đã được cập nhật.
 */
export const updateTodo = async (id, updates, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new TodoError('ID Todo không hợp lệ.', 400);
  }

  let findQuery = { _id: id };

  if (userRole === 'Admin') {
    // Admin có thể cập nhật bất kỳ todo nào
  } else if (userRole === 'User') {
    // User chỉ có thể cập nhật todo do họ tạo HOẶC được giao cho họ
    findQuery.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  } else if (userRole === 'Team Lead') {
    // Team Lead có thể cập nhật todo do họ tạo HOẶC do thành viên trong nhóm của họ tạo
    const team = await Team.findOne({ leadId: userId });
    let allowedCreatorIds = [userId];

    if (team && team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      allowedCreatorIds = allowedCreatorIds.concat(memberIds);
    }
    findQuery.createdBy = { $in: allowedCreatorIds };
  } else {
    throw new TodoError('Bạn không có quyền cập nhật todo này.', 403);
  }

  const updatedTodo = await Todo.findOneAndUpdate(
    findQuery,
    updates,
    { new: true, runValidators: true }
  );

  if (!updatedTodo) {
    throw new TodoError('Không tìm thấy Todo hoặc người dùng không có quyền.', 404);
  }
  return updatedTodo;
};

/**
 * @desc Lấy một mục công việc cụ thể bằng ID của nó, dựa trên vai trò người dùng.
 * @param {string} id ID của todo.
 * @param {string} userId ID của người dùng.
 * @param {string} userRole Vai trò của người dùng.
 * @returns {object} Todo tìm thấy.
 */
export const getTodoById = async (id, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new TodoError('ID Todo không hợp lệ.', 400);
  }

  let findQuery = { _id: id };

  if (userRole === 'Admin') {
    // Admin có thể lấy bất kỳ todo nào
  } else if (userRole === 'User') {
    // User chỉ có thể lấy todo do họ tạo, được giao cho họ, hoặc được chia sẻ với họ
    findQuery.$or = [
      { createdBy: userId },
      { assignedTo: userId },
      { sharedWith: userId }
    ];
  } else if (userRole === 'Team Lead') {
    // Team Lead có thể lấy todo do họ tạo HOẶC do thành viên trong nhóm của họ tạo
    const team = await Team.findOne({ leadId: userId });
    let allowedCreatorIds = [userId];

    if (team && team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      allowedCreatorIds = allowedCreatorIds.concat(memberIds);
    }
    findQuery.createdBy = { $in: allowedCreatorIds };
  } else if (userRole === 'Viewer') {
    // Viewer chỉ có thể lấy todo được chia sẻ với họ
    findQuery.sharedWith = userId;
  }

  const todo = await Todo.findOne(findQuery);

  if (!todo) {
    throw new TodoError('Không tìm thấy Todo hoặc người dùng không có quyền.', 404);
  }
  return todo;
};

/**
 * @desc Lấy tất cả các mục công việc cho người dùng đang đăng nhập dựa trên vai trò của họ.
 * @param {string} userId ID của người dùng.
 * @param {string} userRole Vai trò của người dùng ('Admin', 'User', 'Team Lead', 'Viewer').
 * @param {object} queryParams Các tham số truy vấn để lọc, sắp xếp và phân trang.
 * @returns {object} Danh sách todos và thông tin phân trang.
 */
export const getTodos = async (userId, userRole, queryParams) => {
  const { status, priority, category, isArchived, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

  let query = {};

  if (userRole === 'Admin') {
    // Admin có thể xem tất cả các todo
  } else if (userRole === 'User') {
    // User chỉ có thể xem các todo do họ tạo HOẶC được giao cho họ
    query.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  } else if (userRole === 'Team Lead') {
    // Team Lead có thể xem các todo do họ tạo HOẶC do thành viên trong nhóm của họ tạo
    const team = await Team.findOne({ leadId: userId });
    let allowedCreatorIds = [userId];

    if (team && team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      allowedCreatorIds = allowedCreatorIds.concat(memberIds);
    }
    query.createdBy = { $in: allowedCreatorIds };
  } else if (userRole === 'Viewer') {
    // Viewer chỉ có thể xem các todo được chia sẻ với họ
    query.$or = [{ sharedWith: userId }];
  }

  // Thêm điều kiện lọc nếu các tham số được cung cấp
  if (status) {
    query.status = status;
  }
  if (priority) {
    query.priority = priority;
  }
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }
  if (isArchived !== undefined) {
    query.isArchived = isArchived === 'true';
  }

  // Thiết lập tùy chọn sắp xếp
  const sortOptions = {};
  if (sortBy && ['createdAt', 'dueDate', 'priority', 'title'].includes(sortBy)) {
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  // Thiết lập phân trang
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  // Thực hiện truy vấn với lọc, sắp xếp và phân trang
  const todos = await Todo.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parsedLimit);

  // Lấy tổng số lượng todo khớp với query để tính toán tổng số trang
  const totalTodos = await Todo.countDocuments(query);

  return {
    todos,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalTodos / parsedLimit),
    totalItems: totalTodos,
  };
};

/**
 * @desc Tạo một mục công việc (todo) mới cho người dùng đang đăng nhập.
 * @param {object} todoData Dữ liệu của todo (title, description, dueDate, priority).
 * @param {string} userId ID của người dùng tạo todo.
 * @returns {object} Todo đã được tạo.
 */
export const createTodo = async (todoData, userId) => {
  const { title, description, dueDate, priority } = todoData;

  if (!title) {
    throw new TodoError('Tiêu đề là bắt buộc.', 400);
  }

  const newTodo = new Todo({
    title,
    description,
    dueDate,
    priority,
    createdBy: userId,
  });

  const savedTodo = await newTodo.save();
  return savedTodo;
};

/**
 * @desc Đánh dấu một mục công việc là hoàn thành hoặc chưa hoàn thành.
 * @param {string} id ID của todo cần thay đổi trạng thái hoàn thành.
 * @param {string} userId ID của người dùng thực hiện.
 * @param {string} userRole Vai trò của người dùng.
 * @returns {object} Todo đã được cập nhật.
 */
export const toggleTodoCompletion = async (id, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new TodoError('ID Todo không hợp lệ.', 400);
  }

  let findQuery = { _id: id };

  if (userRole === 'Admin') {
    // Admin có thể thay đổi trạng thái hoàn thành của bất kỳ todo nào
  } else if (userRole === 'User') {
    // User chỉ có thể thay đổi trạng thái hoàn thành của todo do họ tạo HOẶC được giao cho họ
    findQuery.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  } else if (userRole === 'Team Lead') {
    // Team Lead có thể thay đổi trạng thái hoàn thành của todo do họ tạo HOẶC do thành viên trong nhóm của họ tạo
    const team = await Team.findOne({ leadId: userId });
    let allowedCreatorIds = [userId];

    if (team && team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      allowedCreatorIds = allowedCreatorIds.concat(memberIds);
    }
    findQuery.createdBy = { $in: allowedCreatorIds };
  } else {
    throw new TodoError('Bạn không có quyền thay đổi trạng thái hoàn thành của todo này.', 403);
  }

  const todo = await Todo.findOne(findQuery);

  if (!todo) {
    throw new TodoError('Không tìm thấy Todo hoặc người dùng không có quyền.', 404);
  }

  // Đảo ngược trạng thái hoàn thành và cập nhật completedAt
  if (todo.status === 'done') {
    todo.status = 'todo';
    todo.completedAt = null;
  } else {
    todo.status = 'done';
    todo.completedAt = new Date();
  }
  
  await todo.save();
  return todo;
};

/**
 * @desc Lưu trữ (archive) hoặc bỏ lưu trữ (unarchive) một mục công việc.
 * @param {string} id ID của todo cần thay đổi trạng thái lưu trữ.
 * @param {string} userId ID của người dùng thực hiện.
 * @param {string} userRole Vai trò của người dùng.
 * @returns {object} Todo đã được cập nhật.
 */
export const toggleArchiveTodo = async (id, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new TodoError('ID Todo không hợp lệ.', 400);
  }

  let findQuery = { _id: id };

  if (userRole === 'Admin') {
    // Admin có thể thay đổi trạng thái lưu trữ của bất kỳ todo nào
  } else if (userRole === 'User') {
    // User chỉ có thể thay đổi trạng thái lưu trữ của todo do họ tạo HOẶC được giao cho họ
    findQuery.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  } else if (userRole === 'Team Lead') {
    // Team Lead có thể thay đổi trạng thái lưu trữ của todo do họ tạo HOẶC do thành viên trong nhóm của họ tạo
    const team = await Team.findOne({ leadId: userId });
    let allowedCreatorIds = [userId];

    if (team && team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      allowedCreatorIds = allowedCreatorIds.concat(memberIds);
    }
    findQuery.createdBy = { $in: allowedCreatorIds };
  } else {
    throw new TodoError('Bạn không có quyền thay đổi trạng thái lưu trữ của todo này.', 403);
  }

  const todo = await Todo.findOne(findQuery);

  if (!todo) {
    throw new TodoError('Không tìm thấy Todo hoặc người dùng không có quyền.', 404);
  }

  todo.isArchived = !todo.isArchived;
  await todo.save();
  return todo;
};

/**
 * @desc Đánh dấu một mục công việc là hoàn thành hoặc chưa hoàn thành.
 * @param {string} id ID của todo cần thay đổi trạng thái hoàn thành.
 * @param {string} userId ID của người dùng thực hiện.
 * @param {string} userRole Vai trò của người dùng.
 * @returns {object} Todo đã được cập nhật.
 */
export const toggleTodoCompletion = async (id, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new TodoError('ID Todo không hợp lệ.', 400);
  }

  let findQuery = { _id: id };

  if (userRole === 'Admin') {
    // Admin có thể thay đổi trạng thái hoàn thành của bất kỳ todo nào
  } else if (userRole === 'User') {
    // User chỉ có thể thay đổi trạng thái hoàn thành của todo do họ tạo HOẶC được giao cho họ
    findQuery.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  } else if (userRole === 'Team Lead') {
    // Team Lead có thể thay đổi trạng thái hoàn thành của todo do họ tạo HOẶC do thành viên trong nhóm của họ tạo
    const team = await Team.findOne({ leadId: userId });
    let allowedCreatorIds = [userId];

    if (team && team.members.length > 0) {
      const memberIds = team.members.map(member => member.userId);
      allowedCreatorIds = allowedCreatorIds.concat(memberIds);
    }
    findQuery.createdBy = { $in: allowedCreatorIds };
  } else {
    throw new TodoError('Bạn không có quyền thay đổi trạng thái hoàn thành của todo này.', 403);
  }

  const todo = await Todo.findOne(findQuery);

  if (!todo) {
    throw new TodoError('Không tìm thấy Todo hoặc người dùng không có quyền.', 404);
  }

  // Đảo ngược trạng thái hoàn thành và cập nhật completedAt
  if (todo.status === 'done') {
    todo.status = 'todo';
    todo.completedAt = null;
  } else {
    todo.status = 'done';
    todo.completedAt = new Date();
  }
  
  await todo.save();
  return todo;
};



