// 1. Hàm gốc để tạo ra object Lỗi tùy chỉnh
// Nó kế thừa Error mặc định của JS để giữ lại Stack Trace (dòng gây lỗi)
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.status = statusCode;
  return error;
};

// 2. Các hàm tạo lỗi cụ thể (Semantic - Dễ đọc)
const BadRequestError = (message = "Bad Request") => {
  return createError(400, message);
};

const AuthFailureError = (message = "Unauthorized") => {
  return createError(401, message);
};

const NotFoundError = (message = "Not Found") => {
  return createError(404, message);
};

const ForbiddenError = (message = "Forbidden") => {
  return createError(403, message);
};

export {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};
