import express from "express";
import {
  getAllCollections,
  getAllCollectionsAdmin,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleCollectionActive,
  reorderCollections,
  addProductsToCollection,
  removeProductFromCollection,
} from "../Controller/ProductCollectionController.js";
import { AdminMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes
router.get("/get-collections", getAllCollections);
router.get("/get-collection/:id", getCollectionById);

// Admin routes (protected)
router.get("/admin/get-collections", AdminMiddleware, getAllCollectionsAdmin);
router.post("/create", AdminMiddleware, createCollection);
router.put("/update/:id", AdminMiddleware, updateCollection);
router.delete("/delete/:id", AdminMiddleware, deleteCollection);
router.patch("/toggle-active/:id", AdminMiddleware, toggleCollectionActive);
router.put("/reorder", AdminMiddleware, reorderCollections);
router.post("/add-products/:id", AdminMiddleware, addProductsToCollection);
router.delete(
  "/remove-product/:id/:productId",
  AdminMiddleware,
  removeProductFromCollection,
);

export default router;
