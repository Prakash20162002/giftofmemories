import express from "express";
import rateLimit from "express-rate-limit";
import {
  AdminLogin,
  AdminLogout,
  AdminRegister,
  VerifyAdmin,
} from "../Controller/AdminAuthController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";
import { getMetrics, sendTestEmail } from "../Controller/AdminController.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes",
  },
});

router.post("/login", loginLimiter, AdminLogin);
router.post("/logout", AdminLogout);
router.post("/register", AdminRegister);
router.get("/verify", VerifyAdmin);

// Admin-only metrics endpoint
router.get("/metrics", AdminMiddleware, getMetrics);

// Admin-only test email endpoint (helps verify SMTP configuration)
router.post("/test-email", AdminMiddleware, sendTestEmail);

export default router;
