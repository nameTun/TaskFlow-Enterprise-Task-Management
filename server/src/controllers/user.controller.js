import User from "../models/user.model.js";
import { OK, CREATED } from "../core/success.response.js";
import asyncHandler from "../helpers/asyncHandler.js";
import UserDto from "../dtos/user.dto.js";

// Get all users (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, q, role } = req.query;
  const skip = (page - 1) * limit;

  const filter = { deletedAt: null };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .populate("teamId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  const usersDto = users.map((user) => {
    // Merge team info vào DTO nếu cần hiển thị đẹp hơn
    const dto = new UserDto(user);
    if (user.teamId) {
      dto.teamName = user.teamId.name;
    }
    // Tính toán thời gian active giả định (hoặc lấy từ lastLoginAt)
    dto.lastActive = user.updatedAt;
    return dto;
  });

    new OK({
      message: "Lấy danh sách người dùng thành công",
      metadata: {
        users: usersDto,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    }).send(res);
});

// Create User (Admin Only)
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email này đã được sử dụng');
    }

    // Model sẽ tự hash password
    const newUser = await User.create({
        name,
        email,
        passwordHash: password,
        role: role || 'user',
        isVerified: true
    });

    new CREATED({
        message: 'Tạo người dùng mới thành công',
        metadata: new UserDto(newUser)
    }).send(res);
});

// Search Users (Cho phép Team Lead tìm người để mời)
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return new OK({ metadata: [] }).send(res);

  // Tìm user theo tên hoặc email, loại trừ chính mình
  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } }, // Không tìm chính mình
      { deletedAt: null },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  }).select('name email avatar teamId').limit(10); // Giới hạn 10 kết quả

  new OK({
    message: 'Tìm kiếm thành công',
    metadata: users
  }).send(res);
});

// Update User (Admin Only - Change Role)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === req.user._id.toString()) {
    throw new BadRequestError("Bạn không thể tự thay đổi quyền của chính mình");
  }

  const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

  if (!updatedUser) throw new BadRequestError("User not found");

  new OK({
    message: "Cập nhật thành công",
    metadata: new UserDto(updatedUser),
  }).send(res);
});

// Delete User (Admin Only - Soft Delete)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    throw new BadRequestError("Bạn không thể tự xóa tài khoản của chính mình");
  }

  await User.findByIdAndUpdate(id, { deletedAt: new Date() });

  new OK({
    message: "Đã khóa tài khoản người dùng",
  }).send(res);
});