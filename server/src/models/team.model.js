import mongoose from 'mongoose';
const DOCUMENT_NAME = "Team";
const COLLECTION_NAME = "Teams";
// Định nghĩa schema cho model Team (đội/nhóm)
const teamSchema = new mongoose.Schema(
  {
    // Trường name: Tên đội, bắt buộc, duy nhất, cắt khoảng trắng.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Trường description: Mô tả về đội, cắt khoảng trắng.
    description: {
      type: String,
      trim: true,
    },
    // Trường leadId: ID của trưởng nhóm, tham chiếu đến model User, bắt buộc.
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // Đánh chỉ mục để tối ưu truy vấn
      required: true, // Một đội phải có trưởng nhóm
    },
    // Trường members: Mảng các thành viên trong đội.
    members: [
      {
        // userId: ID của thành viên, tham chiếu đến model User.
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        // role: Vai trò của thành viên trong đội, mặc định là 'member'.
        role: {
          type: String,
          enum: ["member", "viewer"],
          default: "member",
        },
        // joinedAt: Thời gian thành viên tham gia đội, mặc định là thời gian hiện tại.
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Trường settings: Các cài đặt cấu hình cho đội.
    settings: {
      // maxMembers: Số lượng thành viên tối đa trong đội, mặc định là 50.
      maxMembers: {
        type: Number,
        default: 50,
      },
      // allowExternalSharing: Cho phép chia sẻ bên ngoài đội hay không, mặc định là false.
      allowExternalSharing: {
        type: Boolean,
        default: false,
      },
    },
    // Trường createdBy: ID của người đã tạo đội, tham chiếu đến model User, bắt buộc.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true, // Di chuyển index vào đây
    },
    // Trường isActive: Trạng thái hoạt động của đội, mặc định là true.
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  {
    timestamps: true, // Tự động thêm trường `createdAt` và `updatedAt`
    collation:COLLECTION_NAME
  }
);

// Tạo model Team từ schema
const Team = mongoose.model(DOCUMENT_NAME, teamSchema);

export default Team;
