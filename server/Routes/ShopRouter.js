// import express from "express";
// import multer from "multer";
// import path from "path";
// import {
//   getAllProducts,
//   getAllProductsAdmin,
//   getProductById,
//   getProductsByCategory,
//   getBestsellerProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   toggleBestseller,
//   toggleActiveStatus,
// } from "../Controller/ShopController.js";
// import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

// const router = express.Router();

// // Multer configuration for image uploads
// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif|webp/;
//   const extname = path.extname(file.originalname).toLowerCase();
//   const mimetype = file.mimetype;

//   if (allowedTypes.test(extname) && mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed!"), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: fileFilter,
// });

// // Public routes
// router.get("/get-products", getAllProducts);
// router.get("/get-product/:id", getProductById);
// router.get("/get-products/category/:categoryId", getProductsByCategory);
// router.get("/get-bestsellers", getBestsellerProducts);

// // Admin routes (protected)
// router.get("/admin/get-products", AdminMiddleware, getAllProductsAdmin);
// router.post(
//   "/add-product",
//   AdminMiddleware,
//   upload.single("image"),
//   addProduct,
// );
// router.put(
//   "/update-product/:id",
//   AdminMiddleware,
//   upload.single("image"),
//   updateProduct,
// );
// router.delete("/delete-product/:id", AdminMiddleware, deleteProduct);
// router.patch("/toggle-bestseller/:id", AdminMiddleware, toggleBestseller);
// router.patch("/toggle-active/:id", AdminMiddleware, toggleActiveStatus);

// export default router;
import express from "express";
import multer from "multer";
import path from "path";

import {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  getProductsByCategory,
  getBestsellerProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleBestseller,
  toggleActiveStatus,
} from "../Controller/ShopController.js";

import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

/* ---------------- MULTER CONFIGURATION ---------------- */

// Store file in memory before uploading to cloud (Cloudinary etc)
const storage = multer.memoryStorage();

// Allow images + videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|webm|mkv/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (
    allowedTypes.test(extname) &&
    (mimetype.startsWith("image/") || mimetype.startsWith("video/"))
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for videos
  },
  fileFilter,
});

/* ---------------- PUBLIC ROUTES ---------------- */

router.get("/get-products", getAllProducts);

router.get("/get-product/:id", getProductById);

router.get("/get-products/category/:categoryId", getProductsByCategory);

router.get("/get-bestsellers", getBestsellerProducts);

/* ---------------- ADMIN ROUTES ---------------- */

router.get(
  "/admin/get-products",
  AdminMiddleware,
  getAllProductsAdmin
);

// Add product with multiple images/videos
router.post(
  "/add-product",
  AdminMiddleware,
  upload.array("media", 10), // max 10 files
  addProduct
);

// Update product with multiple media files
router.put(
  "/update-product/:id",
  AdminMiddleware,
  upload.array("media", 10),
  updateProduct
);

router.delete(
  "/delete-product/:id",
  AdminMiddleware,
  deleteProduct
);

router.patch(
  "/toggle-bestseller/:id",
  AdminMiddleware,
  toggleBestseller
);

router.patch(
  "/toggle-active/:id",
  AdminMiddleware,
  toggleActiveStatus
);

export default router;