import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Tải các biến môi trường từ tệp .env
dotenv.config();

/**
 * @desc Kết nối đến cơ sở dữ liệu MongoDB
 * @returns {Promise<void>} Một Promise sẽ được giải quyết khi kết nối thành công, hoặc bị từ chối nếu có lỗi.
 */
const connectDB = async () => {
  try {
    // Sử dụng mongoose.connect để kết nối đến MongoDB.
    // MONGO_URI được lấy từ biến môi trường, chứa chuỗi kết nối đến DB.
    // Các tùy chọn `useNewUrlParser` và `useUnifiedTopology` được dùng để tránh các cảnh báo lỗi cũ.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    // Thoát khỏi tiến trình với mã  lỗi 1, cho biết ứng dụng không thể chạy nếu không có kết nối DB.
    process.exit(1);
  }
};

export default connectDB;
