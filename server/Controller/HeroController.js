import { Hero } from "../Model/Hero.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Helper function to upload a single file to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "hero",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split("/");
    const publicIdWithExtension = urlParts.slice(-2).join("/");
    const publicId = publicIdWithExtension.split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

export const addHero = async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    let imageUrls = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    const newHero = new Hero({
      images: imageUrls,
      title,
      subtitle,
      buttonText,
      buttonLink,
    });

    await newHero.save();
    res.status(201).json({
      message: "Hero section created successfully",
      hero: newHero,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getHero = async (req, res) => {
  try {
    const hero = await Hero.find().sort({ createdAt: -1 }).limit(1);

    if (!hero || hero.length === 0) {
      return res.status(404).json({ message: "No hero section found" });
    }

    res.status(200).json(hero[0]);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, buttonText, buttonLink, existingImages } =
      req.body;

    const hero = await Hero.findById(id);
    if (!hero) {
      return res.status(404).json({ message: "Hero section not found" });
    }

    // Parse existing images (sent as JSON string from frontend)
    let keepImages = [];
    if (existingImages) {
      try {
        keepImages = JSON.parse(existingImages);
      } catch (e) {
        keepImages = [];
      }
    }

    // Find images to delete (ones that were in hero.images but not in keepImages)
    const imagesToDelete = hero.images.filter(
      (img) => !keepImages.includes(img),
    );

    // Delete removed images from Cloudinary
    for (const imgUrl of imagesToDelete) {
      await deleteFromCloudinary(imgUrl);
    }

    // Upload new images
    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      const results = await Promise.all(uploadPromises);
      newImageUrls = results.map((result) => result.secure_url);
    }

    // Combine existing images with new ones
    const allImages = [...keepImages, ...newImageUrls];

    const updateData = {
      title,
      subtitle,
      buttonText,
      buttonLink,
      images: allImages,
    };

    const updatedHero = await Hero.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Hero section updated successfully",
      hero: updatedHero,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add images to existing hero
export const addImagesToHero = async (req, res) => {
  try {
    const { id } = req.params;

    const hero = await Hero.findById(id);
    if (!hero) {
      return res.status(404).json({ message: "Hero section not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer),
    );
    const results = await Promise.all(uploadPromises);
    const newImageUrls = results.map((result) => result.secure_url);

    hero.images = [...hero.images, ...newImageUrls];
    await hero.save();

    res.status(200).json({
      message: "Images added successfully",
      hero,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Remove a single image from hero
export const removeImageFromHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const hero = await Hero.findById(id);
    if (!hero) {
      return res.status(404).json({ message: "Hero section not found" });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(imageUrl);

    // Remove from hero.images array
    hero.images = hero.images.filter((img) => img !== imageUrl);
    await hero.save();

    res.status(200).json({
      message: "Image removed successfully",
      hero,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reorder images
export const reorderImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    const hero = await Hero.findById(id);
    if (!hero) {
      return res.status(404).json({ message: "Hero section not found" });
    }

    hero.images = images;
    await hero.save();

    res.status(200).json({
      message: "Images reordered successfully",
      hero,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
