import {
  createTodo as createTodoService,
  getTodos as getTodosService,
  getTodoById as getTodoByIdService,
  updateTodo as updateTodoService,
  deleteTodo as deleteTodoService,
  toggleArchiveTodo as toggleArchiveTodoService,
  toggleTodoCompletion as toggleTodoCompletionService,
  TodoError,
} from '../services/todo.service.js';

/**
 * @desc Tạo một mục công việc (todo) mới cho người dùng đang đăng nhập.
 * @route POST /api/todos
 * @access Private
 * @param {object} req Đối tượng yêu cầu, chứa thông tin todo trong body và user ID trong req.user.
 * @param {object} res Đối tượng phản hồi.
 */
export const createTodo = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    const userId = req.user.id;
    const todoData = { title, description, dueDate, priority };

    const savedTodo = await createTodoService(todoData, userId);
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Lỗi khi tạo todo:', error);
    if (error.name === 'TodoError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo todo.' });
  }
};

/**
 * @desc Lấy tất cả các mục công việc cho người dùng đang đăng nhập.
 * @route GET /api/todos
 * @access Private
 * @param {object} req Đối tượng yêu cầu, chứa user ID trong req.user.
 * @param {object} res Đối tượng phản hồi.
 */
export const getTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const queryParams = req.query;

    const { todos, currentPage, totalPages, totalItems } = await getTodosService(userId, userRole, queryParams);

    res.status(200).json({
      todos,
      currentPage,
      totalPages,
      totalItems,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách todos:', error);
    if (error.name === 'TodoError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách todos.' });
  }
};

/**
 * @desc Lấy một mục công việc cụ thể bằng ID của nó.
 * @route GET /api/todos/:id
 * @access Private
 * @param {object} req Đối tượng yêu cầu, chứa ID todo trong params và user ID trong req.user.
 * @param {object} res Đối tượng phản hồi.
 */
export const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const todo = await getTodoByIdService(id, userId, userRole);
    res.status(200).json(todo);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin todo:', error);
    if (error.name === 'TodoError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin todo.' });
  }
};

/**
 * @desc Cập nhật một mục công việc hiện có.
 * @route PUT /api/todos/:id
 * @access Private
 * @param {object} req Đối tượng yêu cầu, chứa ID todo trong params, thông tin cập nhật trong body và user ID trong req.user.
 * @param {object} res Đối tượng phản hồi.
 */
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const updates = req.body;

    const updatedTodo = await updateTodoService(id, updates, userId, userRole);
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Lỗi khi cập nhật todo:', error);
    if (error.name === 'TodoError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật todo.' });
  }
};

/**
 * @desc Xóa một mục công việc bằng ID của nó.
 * @route DELETE /api/todos/:id
 * @access Private
 * @param {object} req Đối tượng yêu cầu, chứa ID todo trong params và user ID trong req.user.
 * @param {object} res Đối tượng phản hồi.
 */
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await deleteTodoService(id, userId, userRole);
    res.status(200).json({ message: 'Todo đã được xóa thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa todo:', error);
    if (error.name === 'TodoError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa todo.' });
  }
};

/**
 * @desc Lưu trữ (archive) hoặc bỏ lưu trữ (unarchive) một mục công việc.
 * @route PUT /api/todos/:id/archive
 * @access Private
 * @param {object} req Đối tượng yêu cầu, chứa ID todo trong params và user ID trong req.user.
 * @param {object} res Đối tượng phản hồi.
 */
export const toggleArchiveTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updatedTodo = await toggleArchiveTodoService(id, userId, userRole);
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái lưu trữ của todo:', error);
    if (error.name === 'TodoError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi thay đổi trạng thái lưu trữ của todo.' });
  }
};

/**
 * @desc Đánh dấu một mục công việc là hoàn thành hoặc chưa hoàn thành.
 * @route PUT /api/todos/:id/toggle-complete
 * @access Private
 * @param {object} req Đối tượng yêu cầu, chứa ID todo trong params và user ID trong req.user.
 * @param {object} res Đối tượng phản hồi.
 */
export const toggleTodoCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updatedTodo = await toggleTodoCompletionService(id, userId, userRole);
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái hoàn thành của todo:', error);
    if (error.name === 'TodoError') {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi thay đổi trạng thái hoàn thành của todo.' });
  }
};
