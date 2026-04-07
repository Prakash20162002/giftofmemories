import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../Controller/ProductCategoryController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedTypes.test(extname) && mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Public routes
router.get("/get-categories", getAllCategories);
router.get("/get-category/:id", getCategoryById);

// Admin routes (protected)
router.get("/admin/get-categories", AdminMiddleware, getAllCategoriesAdmin);
router.post(
  "/add-category",
  AdminMiddleware,
  upload.single("image"),
  addCategory,
);
router.put(
  "/update-category/:id",
  AdminMiddleware,
  upload.single("image"),
  updateCategory,
);
router.delete("/delete-category/:id", AdminMiddleware, deleteCategory);
router.patch("/toggle-status/:id", AdminMiddleware, toggleCategoryStatus);

export default router;
