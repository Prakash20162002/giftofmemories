import express from "express";
import multer from "multer";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../Controller/blogController.js";

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter,
});

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", upload.single("image"), createBlog);
router.put("/:id", upload.single("image"), updateBlog);
router.delete("/:id", deleteBlog);

export default router;
