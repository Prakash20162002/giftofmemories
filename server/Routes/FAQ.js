import express from "express";
import {
  getFAQs,
  getAllFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
} from "../Controller/FAQController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Public
router.get("/", getFAQs);

// Admin
router.get("/all", AdminMiddleware, getAllFAQs);
router.post("/add", AdminMiddleware, addFAQ);
router.put("/update/:id", AdminMiddleware, updateFAQ);
router.delete("/delete/:id", AdminMiddleware, deleteFAQ);

export default router;
