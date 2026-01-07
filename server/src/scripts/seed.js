import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * SEED DATA SCRIPT
 * Lệnh Terminal/server: node src/scripts/seed.js
 * Mục đích: Tạo tài khoản Admin mặc định nếu chưa tồn tại.
 */

const seedAdmin = async () => {
  try {
    // Kết nối DB
    const conn = await mongoose.connect(
          `${process.env.MONGO_URI}` + `${process.env.MONGO_DB_NAME}`
        );
    console.log("Connected to MongoDB...");

    // Thông tin Admin mặc định
    const adminData = {
      name: "Super Admin",
      email: "admin@taskflow.com",
      passwordHash: "Admin@123456", // Password mặc định (sẽ được hash bởi hook pre-save của Model)
      role: "admin",
      isVerified: true,
      avatar:
        "https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff",
    };

    // Kiểm tra xem Admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("⚠️ Admin account already exists:", existingAdmin.email);
    } else {
      // Tạo Admin mới
      // Phải dùng User.create để trigger middleware pre('save') hash password
      const newAdmin = await User.create(adminData);
      console.log("---------------LOG CHHECK------------------------");
      console.log("Admin account created successfully!");
      console.log("---------------------------------------");
      console.log("mail:", adminData.email);
      console.log("Password:", adminData.passwordHash);
      console.log("---------------------------------------");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    // Ngắt kết nối và thoát
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit();
  }
};

seedAdmin();
