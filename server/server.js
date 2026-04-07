import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
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
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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