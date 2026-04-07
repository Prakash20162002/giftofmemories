import { ProductCollection } from "../Model/ProductCollection.js";

// Get all collections (public - only active)
export const getAllCollections = async (req, res) => {
  try {
    const collections = await ProductCollection.find({ isActive: true })
      .populate({
        path: "products",
        match: { isActive: true },
        populate: { path: "category", select: "name" },
      })
      .sort({ order: 1 });

    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all collections (admin - all)
export const getAllCollectionsAdmin = async (req, res) => {
  try {
    const collections = await ProductCollection.find()
      .populate({
        path: "products",
        populate: { path: "category", select: "name" },
      })
      .sort({ order: 1 });

    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get single collection by ID
export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await ProductCollection.findById(id).populate({
      path: "products",
      match: { isActive: true },
      populate: { path: "category", select: "name" },
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create new collection
export const createCollection = async (req, res) => {
  try {
    const { name, description, products, displayStyle } = req.body;

    // Get the highest order number
    const lastCollection = await ProductCollection.findOne().sort({
      order: -1,
    });
    const order = lastCollection ? lastCollection.order + 1 : 0;

    const collection = new ProductCollection({
      name,
      description: description || "",
      products: products || [],
      displayStyle: displayStyle || "grid",
      order,
    });

    await collection.save();

    const populatedCollection = await ProductCollection.findById(
      collection._id,
    ).populate({
      path: "products",
      populate: { path: "category", select: "name" },
    });

    res.status(201).json({
      message: "Collection created successfully",
      collection: populatedCollection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update collection
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, products, displayStyle } = req.body;

    const collection = await ProductCollection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (products) collection.products = products;
    if (displayStyle) collection.displayStyle = displayStyle;

    await collection.save();

    const populatedCollection = await ProductCollection.findById(id).populate({
      path: "products",
      populate: { path: "category", select: "name" },
    });

    res.status(200).json({
      message: "Collection updated successfully",
      collection: populatedCollection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete collection
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await ProductCollection.findByIdAndDelete(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Toggle active status
export const toggleCollectionActive = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await ProductCollection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    collection.isActive = !collection.isActive;
    await collection.save();

    res.status(200).json({
      message: `Collection ${collection.isActive ? "activated" : "deactivated"} successfully`,
      collection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reorder collections
export const reorderCollections = async (req, res) => {
  try {
    const { collections } = req.body; // Array of { id, order }

    if (!collections || !Array.isArray(collections)) {
      return res.status(400).json({ message: "Collections array is required" });
    }

    const updatePromises = collections.map((item) =>
      ProductCollection.findByIdAndUpdate(item.id, { order: item.order }),
    );

    await Promise.all(updatePromises);

    const updatedCollections = await ProductCollection.find()
      .populate({
        path: "products",
        populate: { path: "category", select: "name" },
      })
      .sort({ order: 1 });

    res.status(200).json({
      message: "Collections reordered successfully",
      collections: updatedCollections,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add products to collection
export const addProductsToCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: "Product IDs array is required" });
    }

    const collection = await ProductCollection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Add only products that aren't already in the collection
    const newProducts = productIds.filter(
      (pid) => !collection.products.includes(pid),
    );
    collection.products.push(...newProducts);

    await collection.save();

    const populatedCollection = await ProductCollection.findById(id).populate({
      path: "products",
      populate: { path: "category", select: "name" },
    });

    res.status(200).json({
      message: "Products added to collection successfully",
      collection: populatedCollection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Remove product from collection
export const removeProductFromCollection = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const collection = await ProductCollection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    collection.products = collection.products.filter(
      (pid) => pid.toString() !== productId,
    );

    await collection.save();

    const populatedCollection = await ProductCollection.findById(id).populate({
      path: "products",
      populate: { path: "category", select: "name" },
    });

    res.status(200).json({
      message: "Product removed from collection successfully",
      collection: populatedCollection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
