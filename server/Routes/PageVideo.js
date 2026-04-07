import express from "express";
import multer from "multer";
import path from "path";
import {
  getVideosByPage,
  getAllVideos,
  addVideo,
  addYoutubeVideo,
  updateVideo,
  toggleVideoStatus,
  deleteVideo,
  reorderVideos,
} from "../Controller/PageVideoController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

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

// Public routes
router.get("/page/:pageType", getVideosByPage);

// Admin routes
router.get("/admin/all", AdminMiddleware, getAllVideos);
router.post("/add", AdminMiddleware, upload.single("video"), addVideo);
router.post("/add-youtube", AdminMiddleware, addYoutubeVideo);
router.put("/update/:id", AdminMiddleware, upload.single("video"), updateVideo);
router.patch("/toggle-status/:id", AdminMiddleware, toggleVideoStatus);
router.delete("/delete/:id", AdminMiddleware, deleteVideo);
router.put("/reorder", AdminMiddleware, reorderVideos);

export default router;
