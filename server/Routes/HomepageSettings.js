import express from "express";
import multer from "multer";
import path from "path";
import {
  getHomepageSettings,
  updateHomepageSettings,
  toggleSectionVisibility,
  updateHomeVideoYoutube,
  updateHomeVideoUpload,
  deleteHomeVideo,
  updateVideoOrder,
} from "../Controller/HomepageSettingsController.js";
import { verifyToken } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Multer configuration for video uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedVideoTypes.test(extname) && mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: fileFilter,
});

// Public route - get settings
router.get("/get-settings", getHomepageSettings);

// Admin routes - protected
router.put("/update-settings", verifyToken, updateHomepageSettings);
router.patch("/toggle/:section", verifyToken, toggleSectionVisibility);

// Home video routes
router.post("/video/youtube", verifyToken, updateHomeVideoYoutube);
router.post(
  "/video/upload",
  verifyToken,
  upload.single("video"),
  updateHomeVideoUpload,
);
router.delete("/video/:videoId", verifyToken, deleteHomeVideo);
router.put("/video/reorder", verifyToken, updateVideoOrder);

export default router;
