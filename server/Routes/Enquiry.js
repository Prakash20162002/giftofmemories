import express from "express";
import {
  postEnquiry,
  getEnquiries,
  exportEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
} from "../Controller/EnquiryController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";
const router = express.Router();
router.post("/post-enquiry", postEnquiry);
router.get("/enquiries", AdminMiddleware, getEnquiries);
router.get("/enquiries/:id", AdminMiddleware, getEnquiryById);
router.put("/enquiries/:id/status", AdminMiddleware, updateEnquiryStatus);
router.get("/enquiries/export", AdminMiddleware, exportEnquiries);
export default router;
