import express from "express";
import multer from "multer";
import {
  getAboutContent,
  updateStorySection,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../Controller/AboutController.js";
import { verifyToken } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Public route
router.get("/get-about", getAboutContent);

// Protected routes (admin only)
router.put(
  "/update-story",
  verifyToken,
  upload.single("image"),
  updateStorySection
);
router.post(
  "/add-team-member",
  verifyToken,
  upload.single("image"),
  addTeamMember
);
router.put(
  "/update-team-member/:memberId",
  verifyToken,
  upload.single("image"),
  updateTeamMember
);
router.delete("/delete-team-member/:memberId", verifyToken, deleteTeamMember);

export default router;
