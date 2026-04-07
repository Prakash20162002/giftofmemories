import express from "express";
import multer from "multer";
import {
  getPageHero,
  getAllPageHeroes,
  upsertPageHero,
  resetPageHero,
} from "../Controller/PageHeroController.js";
import { verifyToken } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get("/get/:page", getPageHero);

// Admin routes
router.get("/admin/get-all", verifyToken, getAllPageHeroes);
router.put(
  "/admin/update/:page",
  verifyToken,
  upload.single("image"),
  upsertPageHero,
);
router.delete("/admin/reset/:page", verifyToken, resetPageHero);

export default router;
