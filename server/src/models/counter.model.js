import mongoose from "mongoose";
const DOCUMENT_NAME = "Counter";
// const COLLECTION_NAME = "Counters";

/**
 * COUNTER MODEL (Mô hình Bộ đếm)
 * ------------------------------------------------------------------
 * Dùng để triển khai "Auto Increment ID" trong MongoDB.
 * MongoDB mặc định dùng ObjectID (chuỗi dài ngẫu nhiên), không có auto-increment như SQL.
 * Collection này sẽ lưu trạng thái số đếm hiện tại cho các model khác.
 */

const counterSchema = new mongoose.Schema({
  // _id: Tên của sequence. Ví dụ: 'taskId', 'orderId', 'invoiceId'
  _id: { type: String, required: true },

  // seq: Số thứ tự hiện tại.
  // Ví dụ bắt đầu từ 1000 để trông chuyên nghiệp hơn (tránh số 1, 2 quá nhỏ)
  seq: { type: Number, default: 1000 },
});

const Counter = mongoose.model(DOCUMENT_NAME, counterSchema);
export default Counter;
