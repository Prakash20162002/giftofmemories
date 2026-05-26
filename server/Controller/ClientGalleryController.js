import { ClientGallery } from "../Model/ClientGallery.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Helper to destroy images on Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    const urlParts = imageUrl.split("/");
    const publicIdWithExtension = urlParts.slice(-2).join("/");
    const publicId = publicIdWithExtension.split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary destroy failed:", error);
  }
};

// 1. Get all active galleries (Public)
export const getClientGalleries = async (req, res) => {
  try {
    const galleries = await ClientGallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(galleries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Get single gallery by ID (Public)
export const getClientGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await ClientGallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: "Client gallery not found" });
    }
    res.status(200).json(gallery);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. Get all client galleries (Admin)
export const adminGetClientGalleries = async (req, res) => {
  try {
    const galleries = await ClientGallery.find().sort({ createdAt: -1 });
    res.status(200).json(galleries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 4. Create new client gallery (Admin)
export const adminCreateClientGallery = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Access uploaded files
    const coverFile = req.files && req.files["coverImage"] ? req.files["coverImage"][0] : null;
    const imagesFiles = req.files && req.files["images"] ? req.files["images"] : [];

    if (!coverFile) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    // Upload Cover Image
    const coverUploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "client-galleries",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(coverFile.buffer).pipe(uploadStream);
    });

    const coverImageUrl = await coverUploadPromise;

    // Upload Secondary Gallery Images
    const uploadPromises = imagesFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "client-galleries",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    });

    const galleryImageUrls = await Promise.all(uploadPromises);

    const newGallery = new ClientGallery({
      name,
      category: category || "Wedding",
      coverImage: coverImageUrl,
      images: galleryImageUrls,
    });

    await newGallery.save();

    res.status(201).json({
      message: "Client gallery created successfully",
      gallery: newGallery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 5. Update client gallery (Admin)
export const adminUpdateClientGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, isActive, deletedImages } = req.body;

    const gallery = await ClientGallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: "Client gallery not found" });
    }

    // Update text fields
    if (name !== undefined) gallery.name = name;
    if (category !== undefined) gallery.category = category;
    if (isActive !== undefined) {
      gallery.isActive = isActive === "true" || isActive === true;
    }

    // Handle deleted images (if any URLs are passed to remove)
    if (deletedImages) {
      const parsedDeletedImages = JSON.parse(deletedImages);
      if (Array.isArray(parsedDeletedImages) && parsedDeletedImages.length > 0) {
        for (const url of parsedDeletedImages) {
          await deleteFromCloudinary(url);
        }
        gallery.images = gallery.images.filter(
          (img) => !parsedDeletedImages.includes(img)
        );
      }
    }

    // Access newly uploaded files
    const coverFile = req.files && req.files["coverImage"] ? req.files["coverImage"][0] : null;
    const imagesFiles = req.files && req.files["images"] ? req.files["images"] : [];

    // Replace Cover Image if provided
    if (coverFile) {
      // Delete old cover image
      if (gallery.coverImage) {
        await deleteFromCloudinary(gallery.coverImage);
      }

      // Upload new cover
      const coverUploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "client-galleries",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(coverFile.buffer).pipe(uploadStream);
      });

      gallery.coverImage = await coverUploadPromise;
    }

    // Append new images if provided
    if (imagesFiles.length > 0) {
      const uploadPromises = imagesFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "client-galleries",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      });

      const newUrls = await Promise.all(uploadPromises);
      gallery.images = [...gallery.images, ...newUrls];
    }

    await gallery.save();

    res.status(200).json({
      message: "Client gallery updated successfully",
      gallery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 6. Delete client gallery (Admin)
export const adminDeleteClientGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await ClientGallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: "Client gallery not found" });
    }

    // Delete cover image from Cloudinary
    if (gallery.coverImage) {
      await deleteFromCloudinary(gallery.coverImage);
    }

    // Delete all secondary images from Cloudinary
    if (gallery.images && gallery.images.length > 0) {
      for (const url of gallery.images) {
        await deleteFromCloudinary(url);
      }
    }

    await ClientGallery.findByIdAndDelete(id);

    res.status(200).json({ message: "Client gallery deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
