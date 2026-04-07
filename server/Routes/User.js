import express from "express";
import {
  getAllUsers,
  getApprovedUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
  signupUser,
  loginUser,
} from "../Controller/UserController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

// Admin protected routes
router.get("/all", AdminMiddleware, getAllUsers);
router.get("/approved", AdminMiddleware, getApprovedUsers);
router.get("/:id", AdminMiddleware, getUserById);
router.post("/create", AdminMiddleware, createUser);
router.put("/:id", AdminMiddleware, updateUser);
router.delete("/:id", AdminMiddleware, deleteUser);
router.patch("/:id/approve", AdminMiddleware, approveUser);
router.patch("/:id/reject", AdminMiddleware, rejectUser);

export default router;
