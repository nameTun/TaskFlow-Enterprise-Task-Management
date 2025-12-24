// // 1. Hàm gốc để gửi phản hồi chuẩn
// const sendSuccess = (res, { message, data = {}, statusCode = 200 }) => {
//   return res.status(statusCode).json({
//     status: "success", // Hoặc 'success' tùy bạn quy ước
//     message: message,
//     data: data,
//   });
// };

// // 2. Các hàm cụ thể cho từng trường hợp
// const OK = (res, message, data) => {
//   return sendSuccess(res, {
//     message,
//     data,
//     statusCode: 200,
//   });
// };

// const CREATED = (res, message, data) => {
//   return sendSuccess(res, {
//     message,
//     data,
//     statusCode: 201,
//   });
// };

// export{
//   OK,
//   CREATED,
// };

// Định nghĩa các Status Code và Reason
const StatusCode = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  OK: 'Success',
  CREATED: 'Created!',
};

// Class cha: SuccessResponse
class SuccessResponse {
  constructor({ message, statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, metadata = {} }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  // Hàm gửi phản hồi về client
  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

// 200 OK
class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

// 201 Created
class CREATED extends SuccessResponse {
  constructor({ message, statusCode = StatusCode.CREATED, reasonStatusCode = ReasonStatusCode.CREATED, metadata, options = {} }) {
    super({ message, statusCode, reasonStatusCode, metadata });
    this.options = options;
  }
}

export {
  OK,
  CREATED,
  SuccessResponse
};
