import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import compression from "compression";
import path from "path";
import helmet from "helmet"; // Security headers
import { fileURLToPath } from "url";
import { createServer } from "http"; // NEW: Required for WebSockets
import { connectDB } from "./config/db.js";

// Existing Route Imports
import adminRouter from "./Routes/AdminAuth.js";
import ServicesRouter from "./Routes/Services.js";
import GalleryRouter from "./Routes/Gallery.js";
import EnquiryRouter from "./Routes/Enquiry.js";
import TestimonialRouter from "./Routes/Testimonial.js";
import PopupRouter from "./Routes/Popup.js";
import HeroRouter from "./Routes/Hero.js";
import BlogRouter from "./Routes/Blog.js";
import ShopRouter from "./Routes/ShopRouter.js";
import ProductCategoryRouter from "./Routes/ProductCategoryRouter.js";
import UserRouter from "./Routes/User.js";
import AboutRouter from "./Routes/About.js";
import HomepageSettingsRouter from "./Routes/HomepageSettings.js";
import PageHeroRouter from "./Routes/PageHero.js";
import HomepageGalleryRouter from "./Routes/HomepageGallery.js";
import ClientGalleryRouter from "./Routes/ClientGallery.js";
import PageVideoRouter from "./Routes/PageVideo.js";
import ProductCollectionRouter from "./Routes/ProductCollectionRouter.js";
import FAQRouter from "./Routes/FAQ.js";
import OfferRouter from "./Routes/Offer.js";
import leadRoutes from './Routes/Lead.js';

// --- NEW: WHATSAPP CRM & WEBSOCKET IMPORTS ---
import { startClient } from "./whatsapp/whatsapp.js"; 
import { initializeWebSocket } from "./whatsapp/statusBroadcaster.js"; 
import WhatsAppReminderRouter from "./Routes/WhatsAppReminder.js"; 
import "./whatsapp/reminderScheduler.js"; // Replaces the old cron.js

dotenv.config();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- GZIP COMPRESSION (Reduces JSON API response payload size) ---
app.use(compression());

// --- AUTOMATIC CLOUDINARY URL OPTIMIZATION MIDDLEWARE ---
// Dynamically converts images to WebP/AVIF formats (f_auto) and applies visual lossless compression (q_auto)
const optimizeCloudinaryUrl = (url) => {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("/f_auto") || url.includes("/q_auto")) return url;
  // If it's an image upload, restrict maximum width to 1200px (c_limit prevents scaling up)
  if (url.includes("/image/upload/")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_1200,c_limit/");
  }
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

const optimizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    return optimizeCloudinaryUrl(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(optimizeObject);
  }
  if (typeof obj === "object") {
    if (obj instanceof Date || obj instanceof RegExp || Buffer.isBuffer(obj)) {
      return obj;
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = optimizeObject(obj[key]);
      }
    }
  }
  return obj;
};

// --- GLOBAL RESPONSE METHOD OVERRIDE FOR CLOUDINARY OPTIMIZATION ---
// Overrides the default express.response.json globally once at startup.
// This avoids recursive method wrapping on every request that leads to RangeError stack overflows.
const originalJson = express.response.json;
express.response.json = function (body) {
  try {
    if (body) {
      // Safely strip Mongoose documents' circular references using JSON serialization
      const plainBody = JSON.parse(JSON.stringify(body));
      const optimized = optimizeObject(plainBody);
      return originalJson.call(this, optimized);
    }
  } catch (err) {
    console.error("Cloudinary URL optimization failed:", err);
  }
  return originalJson.call(this, body);
};

// --- NEW: HTTP SERVER FOR WEBSOCKET SUPPORT ---
// WebSockets require a raw HTTP server to attach to, rather than just the Express app
const server = createServer(app);
initializeWebSocket(server);

// --- GLOBAL ERROR HANDLERS ---
process.on('unhandledRejection', err => {
  console.error('✗ Unhandled promise rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('✗ Uncaught exception:', err);
});

// --- SECURITY MIDDLEWARE (Fixes Lighthouse High Severity Issues) ---
app.use(helmet({
  contentSecurityPolicy: false, // Set to false to allow Cloudinary/External images, or configure specifically
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());
app.use(cookieParser());

// --- CORS CONFIGURATION ---
app.use(
  cors({
    origin: [
      process.env.FRONT_END_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:4173",
      "http://localhost:4174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
// Set Cache-Control headers for static uploads to improve client-side caching (Lighthouse Best Practice)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "30d",
    immutable: true,
  })
);

// --- DATABASE CONNECTION ---
await connectDB();

// --- API ROUTES ---
app.use("/api/admin", adminRouter);
app.use("/api/services", ServicesRouter);
app.use("/api/gallery", GalleryRouter);
app.use("/api/enquiry", EnquiryRouter);
app.use("/api/testimonial", TestimonialRouter);
app.use("/api/pop", PopupRouter);
app.use("/api/hero", HeroRouter);
app.use("/api/blogs", BlogRouter);
app.use("/api/shop", ShopRouter);
app.use("/api/product-categories", ProductCategoryRouter);
app.use("/api/users", UserRouter);
app.use("/api/about", AboutRouter);
app.use("/api/homepage-settings", HomepageSettingsRouter);
app.use("/api/page-hero", PageHeroRouter);
app.use("/api/homepage-gallery", HomepageGalleryRouter);
app.use("/api/client-gallery", ClientGalleryRouter);
app.use("/api/page-videos", PageVideoRouter);
app.use("/api/product-collections", ProductCollectionRouter);
app.use("/api/faq", FAQRouter);
app.use("/api/faqs", FAQRouter);
app.use("/api/offers", OfferRouter);
app.use('/api/leads', leadRoutes);

// --- NEW: WHATSAPP CRM ROUTE ---
app.use("/api/whatsapp-reminder", WhatsAppReminderRouter);

// --- WHATSAPP INITIALIZATION ---
startClient();

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
// CRITICAL FIX: We must call .listen() on the 'server' variable, not 'app', to ensure WebSockets work
server.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
});