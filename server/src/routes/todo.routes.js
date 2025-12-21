import express from 'express';
// Nhập các hàm xử lý logic Todo từ todo.controller.js
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleArchiveTodo,
  toggleTodoCompletion,
} from '../controllers/todo.controller.js';
// Nhập middleware xác thực token
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router(); // Tạo một đối tượng Router

// Áp dụng middleware `verifyToken` cho tất cả các tuyến Todo.
// Điều này đảm bảo rằng tất cả các thao tác trên todo đều yêu cầu người dùng phải được xác thực.
router.use(verifyToken);

// @route   /api/todos
// Tuyến để lấy tất cả todos và tạo todo mới
router.route('/')
  .get(authorizeRoles(['Admin', 'Team Lead', 'User', 'Viewer']), getTodos)   // GET yêu cầu sẽ được xử lý bởi hàm `getTodos` để lấy danh sách todos
  .post(authorizeRoles(['Admin', 'Team Lead', 'User']), createTodo); // POST yêu cầu sẽ được xử lý bởi hàm `createTodo` để tạo todo mới

// @route   /api/todos/:id
// Tuyến để lấy, cập nhật hoặc xóa một todo cụ thể bằng ID của nó
router.route('/:id')
  .get(authorizeRoles(['Admin', 'Team Lead', 'User', 'Viewer']), getTodoById)    // GET yêu cầu sẽ được xử lý bởi hàm `getTodoById` để lấy một todo theo ID
  .put(authorizeRoles(['Admin', 'Team Lead', 'User']), updateTodo)     // PUT yêu cầu sẽ được xử lý bởi hàm `updateTodo` để cập nhật một todo theo ID
  .delete(authorizeRoles(['Admin', 'Team Lead', 'User']), deleteTodo); // DELETE yêu cầu sẽ được xử lý bởi hàm `deleteTodo` để xóa một todo theo ID

// @route   PUT /api/todos/:id/archive
// Tuyến để lưu trữ (archive) hoặc bỏ lưu trữ (unarchive) một todo cụ thể bằng ID của nó
router.route('/:id/archive')
  .put(authorizeRoles(['Admin', 'Team Lead', 'User']), toggleArchiveTodo); // PUT yêu cầu sẽ được xử lý bởi hàm `toggleArchiveTodo`

// @route   PUT /api/todos/:id/toggle-complete
// Tuyến để đánh dấu một todo là hoàn thành hoặc chưa hoàn thành
router.route('/:id/toggle-complete')
  .put(authorizeRoles(['Admin', 'Team Lead', 'User']), toggleTodoCompletion); // PUT yêu cầu sẽ được xử lý bởi hàm `toggleTodoCompletion`

export default router;
