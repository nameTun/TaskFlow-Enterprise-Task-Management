import express from "express";
import { chat } from "../controllers/ai.controller.js";
const router = express.Router();


/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI Agent
 *     description: Interacts with Gemini AI. Supports **Function Calling** (e.g., asking "Create a task..." will actually create a task in DB).
 *     tags: [AI Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
*             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Tôi đang quản lý những user nào?"
 *     responses:
 *       200:
 *         description: AI text response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         reply:
 *                           type: string
 *                           description: Markdown formatted response
 */
router.post('/chat', chat);

export default router;