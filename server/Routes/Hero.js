import express from "express";
import multer from "multer";
import {
  addHero,
  getHero,
  updateHero,
  addImagesToHero,
  removeImageFromHero,
  reorderImages,
} from "../Controller/HeroController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedImageTypes.test(file.originalname.toLowerCase());
  const mimetype = file.mimetype.startsWith("image/");

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

// Public routes
router.get("/hero", getHero);

// Admin routes - use array for multiple images
router.post(
  "/admin/hero",
  AdminMiddleware,
  upload.array("images", 10),
  addHero,
);
router.put(
  "/admin/hero/:id",
  AdminMiddleware,
  upload.array("images", 10),
  updateHero,
);
router.post(
  "/admin/hero/:id/add-images",
  AdminMiddleware,
  upload.array("images", 10),
  addImagesToHero,
);
router.delete(
  "/admin/hero/:id/remove-image",
  AdminMiddleware,
  removeImageFromHero,
);
router.put("/admin/hero/:id/reorder", AdminMiddleware, reorderImages);

export default router;
