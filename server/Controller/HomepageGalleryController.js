import { HomepageGallery } from "../Model/HomepageGallery.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Get all images for a specific section (public)
export const getGalleryBySection = async (req, res) => {
  try {
    const { section } = req.params;

    if (!["parallax", "scroll", "stacked"].includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    const images = await HomepageGallery.find({ section, isActive: true }).sort(
      {
        order: 1,
      },
    );

    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all gallery images (admin)
export const getAllGalleryImages = async (req, res) => {
  try {
    const images = await HomepageGallery.find().sort({ section: 1, order: 1 });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add new image (admin)
export const addGalleryImage = async (req, res) => {
  try {
    const { section, alt, category, order } = req.body;

    if (!["parallax", "scroll", "stacked"].includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "homepage-gallery",
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

    const newImage = new HomepageGallery({
      section,
      imageUrl: result.secure_url,
      alt: alt || "Gallery Image",
      category: category || "",
      order: order || 0,
    });

    await newImage.save();

    res.status(201).json({
      message: "Image added successfully",
      image: newImage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update image (admin)
export const updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { section, alt, category, order, isActive } = req.body;

    const image = await HomepageGallery.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Update fields
    if (section && ["parallax", "scroll", "stacked"].includes(section)) {
      image.section = section;
    }
    if (alt !== undefined) image.alt = alt;
    if (category !== undefined) image.category = category;
    if (order !== undefined) image.order = order;
    if (isActive !== undefined) image.isActive = isActive;

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (image.imageUrl) {
        const urlParts = image.imageUrl.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }

      // Upload new image
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "homepage-gallery",
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
      image.imageUrl = result.secure_url;
    }

    await image.save();

    res.status(200).json({
      message: "Image updated successfully",
      image,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete image (admin)
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await HomepageGallery.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary
    if (image.imageUrl) {
      const urlParts = image.imageUrl.split("/");
      const publicIdWithExtension = urlParts.slice(-2).join("/");
      const publicId = publicIdWithExtension.split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }

    await HomepageGallery.findByIdAndDelete(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Bulk upload images (admin)
export const bulkUploadImages = async (req, res) => {
  try {
    const { section } = req.body;

    if (!["parallax", "scroll", "stacked"].includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const uploadedImages = [];

    // Get current max order for the section
    const maxOrderImage = await HomepageGallery.findOne({ section }).sort({
      order: -1,
    });
    let currentOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    for (const file of req.files) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "homepage-gallery",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;

      const newImage = new HomepageGallery({
        section,
        imageUrl: result.secure_url,
        alt: "Gallery Image",
        order: currentOrder++,
      });

      await newImage.save();
      uploadedImages.push(newImage);
    }

    res.status(201).json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
