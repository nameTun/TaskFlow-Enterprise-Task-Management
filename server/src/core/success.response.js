// 1. Hàm gốc để gửi phản hồi chuẩn
const sendSuccess = (res, { message, metadata = {}, statusCode = 200 }) => {
  return res.status(statusCode).json({
    status: "success", // Hoặc 'success' tùy bạn quy ước
    message: message,
    metadata: metadata,
  });
};

// 2. Các hàm cụ thể cho từng trường hợp
const OK = (res, message, metadata) => {
  return sendSuccess(res, {
    message,
    metadata,
    statusCode: 200,
  });
};

const CREATED = (res, message, metadata) => {
  return sendSuccess(res, {
    message,
    metadata,
    statusCode: 201,
  });
};

export{
  OK,
  CREATED,
};
