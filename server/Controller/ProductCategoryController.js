import { ProductCategory } from "../Model/ProductCategory.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Get all categories (public - active only)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all categories (admin - all)
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await ProductCategory.find().sort({
      order: 1,
      createdAt: -1,
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add a new category
export const addCategory = async (req, res) => {
  try {
    const { name, description, order } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await ProductCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    let imageUrl = "";

    // Upload image if provided
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "product-categories",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    const newCategory = new ProductCategory({
      name,
      description: description || "",
      image: imageUrl,
      order: order ? Number(order) : 0,
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order, isActive } = req.body;

    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await ProductCategory.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined)
      updateData.isActive = isActive === "true" || isActive === true;

    // Handle image upload if new file is provided
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "product-categories",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;
      updateData.image = result.secure_url;
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await ProductCategory.findByIdAndDelete(id);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Toggle category active status
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
