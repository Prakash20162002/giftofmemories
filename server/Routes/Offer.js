import express from "express";
import multer from "multer";
import path from "path";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";
import { getActiveOffer, getAllOffers, createOffer, toggleOfferStatus, deleteOffer } from "../Controller/OfferController.js";

const router = express.Router();
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// Public Route
router.get("/active", getActiveOffer);

// Admin Routes
router.get("/admin/all", AdminMiddleware, getAllOffers);
router.post("/admin/create", AdminMiddleware, upload.single("image"), createOffer);
router.patch("/admin/toggle/:id", AdminMiddleware, toggleOfferStatus);
router.delete("/admin/delete/:id", AdminMiddleware, deleteOffer);

export default router;