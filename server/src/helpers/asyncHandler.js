// Hàm bọc (Higher Order Function)
 const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
export default asyncHandler;


// Và đây là Controller của bạn sau khi dùng nó:
// task.controller.js
// const { asyncHandler } = require('../helpers/asyncHandler');

// // Không còn try-catch nữa! Code chỉ tập trung vào logic.
// createTask = asyncHandler(async (req, res, next) => {
//     const result = await TaskService.create(req.body);
//     return res.status(201).json(result);
// });