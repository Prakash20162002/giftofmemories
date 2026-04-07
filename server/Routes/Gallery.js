import express from "express";
import multer from "multer";
import path from "path";
import {
  addGallery,
  addMultipleGallery,
  deleteGallery,
  getGallery,
  updateGallery,
  addYoutubeVideo,
  getYoutubeVideos,
} from "../Controller/GalleryController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";
const router = express.Router();
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (
    (allowedImageTypes.test(extname) && mimetype.startsWith("image/")) ||
    (allowedVideoTypes.test(extname) && mimetype.startsWith("video/"))
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});
router.get("/get-gallery", getGallery);
router.get("/get-youtube-videos", getYoutubeVideos);
router.post("/add-gallery", AdminMiddleware, upload.single("file"), addGallery);
router.post("/add-youtube", AdminMiddleware, addYoutubeVideo);
router.post(
  "/add-multiple-gallery",
  AdminMiddleware,
  upload.array("files", 10),
  addMultipleGallery
); // Max 10 files
router.put(
  "/update-gallery/:id",
  AdminMiddleware,
  upload.single("file"),
  updateGallery
);
router.delete("/delete-gallery/:id", AdminMiddleware, deleteGallery);
export default router;
