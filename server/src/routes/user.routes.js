import express from "express";
import {getAllUsers, searchUsers,createUser, updateUser, deleteUser} from "../controllers/user.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.use(protect);

// Admin Routes
router.get('/', restrictTo('admin'), getAllUsers);
router.post("/", restrictTo("admin"), createUser);
router.patch("/:id", restrictTo("admin"), updateUser);
router.delete("/:id", restrictTo("admin"), deleteUser);


// Search Routes (Cho mọi user authenticated)
router.get('/search', searchUsers);

export default router;
