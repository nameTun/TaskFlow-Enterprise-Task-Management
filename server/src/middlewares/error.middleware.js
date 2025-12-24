export const errorHandle = (error, req, res, next) => {
  // Lấy status code từ error, nếu không có thì mặc định là 500
  const statusCode = error.status || 500;

  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
    // Chỉ hiện stack trace (dòng lỗi) khi đang Dev để debug
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

export default errorHandle;