import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
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
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file — supports large high-res photos
    fieldSize: 100 * 1024 * 1024, // 100MB field value size limit for HTML content
  },
  fileFilter: fileFilter,
});

// --- SUNEDITOR INLINE IMAGE UPLOAD ---
// SunEditor POSTs images here with field name "file".
// Must return: { result: [{ url, name, size }] }
router.post("/upload-image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ errorMessage: "No image file received." });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blogs/inline",
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    // SunEditor expects this exact response shape
    return res.status(200).json({
      result: [
        {
          url: result.secure_url,
          name: req.file.originalname,
          size: req.file.size,
        },
      ],
    });
  } catch (error) {
    console.error("Blog inline image upload failed:", error);
    return res.status(500).json({ errorMessage: error.message });
  }
});

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", upload.single("image"), createBlog);
router.put("/:id", upload.single("image"), updateBlog);
router.delete("/:id", deleteBlog);

export default router;
