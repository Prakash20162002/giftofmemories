import express from "express";
import multer from "multer";
import {
  addPopup,
  getPopup,
  updatePopup,
} from "../Controller/PopupController.js";
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
router.post("/admin/popup", AdminMiddleware, upload.single("image"), addPopup);
router.get("/popup", getPopup);
router.put(
  "/admin/popup/:id",
  AdminMiddleware,
  upload.single("image"),
  updatePopup
);
export default router;
