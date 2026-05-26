import express from "express";
import multer from "multer";
import {
  getClientGalleries,
  getClientGalleryById,
  adminGetClientGalleries,
  adminCreateClientGallery,
  adminUpdateClientGallery,
  adminDeleteClientGallery,
} from "../Controller/ClientGalleryController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const uploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 50 },
]);

// Public routes
router.get("/active", getClientGalleries);
router.get("/active/:id", getClientGalleryById);

// Admin routes
router.get("/admin/get-all", AdminMiddleware, adminGetClientGalleries);
router.post("/admin/create", AdminMiddleware, uploadFields, adminCreateClientGallery);
router.put("/admin/update/:id", AdminMiddleware, uploadFields, adminUpdateClientGallery);
router.delete("/admin/delete/:id", AdminMiddleware, adminDeleteClientGallery);

export default router;
