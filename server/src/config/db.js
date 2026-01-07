import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @desc Kết nối đến cơ sở dữ liệu MongoDB
 * @returns {Promise<void>} Một Promise sẽ được giải quyết khi kết nối thành công, hoặc bị từ chối nếu có lỗi.
 */
const connectDB = async () => {
  try {
    // Sử dụng mongoose.connect để kết nối đến MongoDB.
    // MONGO_URI được lấy từ biến môi trường, chứa chuỗi kết nối đến DB.
    const conn = await mongoose.connect(
      `${process.env.MONGO_URI}` + `${process.env.MONGO_DB_NAME}`
    );

    console.log(`MongoDB đã kết nối: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    // Thoát khỏi tiến trình với mã  lỗi 1, cho biết ứng dụng không thể chạy nếu không có kết nối DB.
    process.exit(1);
  }
};

export default connectDB;
