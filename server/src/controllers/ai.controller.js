import asyncHandler from "../helpers/asyncHandler.js";
import aiService from "../services/ai.service.js";
import { OK } from "../core/success.response.js";
import User from "../models/user.model.js";

export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  // Validate basic
  if (!message || message.trim().length === 0) {
    throw new Error("Tin nhắn không được để trống");
  }

  // Lấy thông tin User đầy đủ hơn (bao gồm tên Team) để nạp Context cho AI
  const inforUser = await User.findById(req.user._id).populate(
    "teamId",
    "name description"
  );

  const aiResponse = await aiService.chatWithGemini(message, inforUser);

  new OK({
    message: "AI Success",
    metadata: {
      reply: aiResponse,
    },
  }).send(res);
});