import express from "express";
import multer from "multer";
import {
  addService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "../Controller/ServicesController.js";
import {
  getPackages,
  getPackagesWithServices,
  getMostBookedPackages,
  addPackage,
  updatePackage,
  deletePackage,
} from "../Controller/PackageController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter to allow only images
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
router.get("/services", getServices);
router.get("/packages", getPackages);
router.get("/packages-with-services", getPackagesWithServices);
router.get("/most-booked-packages", getMostBookedPackages);

router.post(
  "/add-service",
  AdminMiddleware,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "logo", maxCount: 1 },
  ]),
  addService
);
router.get("/service/:id", getServiceById);
router.put(
  "/update-service/:id",
  AdminMiddleware,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "logo", maxCount: 1 },
  ]),
  updateService
);
router.delete("/delete-service/:id", AdminMiddleware, deleteService);
router.post("/packages", AdminMiddleware, upload.single("image"), addPackage);
router.put(
  "/packages/:id",
  AdminMiddleware,
  upload.single("image"),
  updatePackage
);
router.delete("/packages/:id", AdminMiddleware, deletePackage);
export default router;
