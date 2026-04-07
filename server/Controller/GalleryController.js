import { Gallery } from "../Model/Gallery.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find();
    res.status(200).json(gallery);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const addGallery = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const { tags } = req.body;
    const resourceType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";

    // Upload buffer to Cloudinary using stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gallery",
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    const newGalleryItem = new Gallery({
      url: result.secure_url,
      type: resourceType,
      tags: tags ? JSON.parse(tags) : [],
    });

    await newGalleryItem.save();
    res.status(201).json({
      message: "Gallery item added successfully",
      gallery: newGalleryItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const addMultipleGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Files are required" });
    }

    const { tags } = req.body;
    const parsedTags = tags ? JSON.parse(tags) : [];

    const uploadPromises = req.files.map((file) => {
      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "gallery",
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({ result, resourceType });
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Create gallery items for all uploaded files
    const galleryItems = uploadResults.map(({ result, resourceType }) => ({
      url: result.secure_url,
      type: resourceType,
      tags: parsedTags,
    }));

    const savedItems = await Gallery.insertMany(galleryItems);

    res.status(201).json({
      message: `${savedItems.length} gallery items added successfully`,
      gallery: savedItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    const updateData = {};

    if (req.file) {
      const resourceType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      // Upload new file to Cloudinary using stream
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "gallery",
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;

      // Get old gallery item to delete old cloudinary file
      const oldGallery = await Gallery.findById(id);
      if (oldGallery && oldGallery.url) {
        const urlParts = oldGallery.url.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        await cloudinary.uploader.destroy(publicId, {
          resource_type: oldGallery.type,
        });
      }

      updateData.url = result.secure_url;
      updateData.type = resourceType;
    }

    if (tags) {
      updateData.tags = JSON.parse(tags);
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedGallery) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.status(200).json({
      message: "Gallery item updated successfully",
      gallery: updatedGallery,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGallery = await Gallery.findByIdAndDelete(id);

    if (!deletedGallery) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    // Only try to delete from Cloudinary if it's not a YouTube video
    if (deletedGallery.url && deletedGallery.type !== "youtube") {
      const urlParts = deletedGallery.url.split("/");
      const publicIdWithExtension = urlParts.slice(-2).join("/");
      const publicId = publicIdWithExtension.split(".")[0];

      await cloudinary.uploader.destroy(publicId, {
        resource_type: deletedGallery.type,
      });
    }

    res.status(200).json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add YouTube video link
export const addYoutubeVideo = async (req, res) => {
  try {
    const { youtubeUrl, title, tags } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ message: "YouTube URL is required" });
    }

    // Extract YouTube video ID from various URL formats
    let youtubeId = null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = youtubeUrl.match(pattern);
      if (match) {
        youtubeId = match[1];
        break;
      }
    }

    if (!youtubeId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const newGalleryItem = new Gallery({
      url: youtubeUrl,
      type: "youtube",
      youtubeId: youtubeId,
      title: title || "",
      tags: tags ? JSON.parse(tags) : [],
    });

    await newGalleryItem.save();
    res.status(201).json({
      message: "YouTube video added successfully",
      gallery: newGalleryItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get only YouTube videos
export const getYoutubeVideos = async (req, res) => {
  try {
    const videos = await Gallery.find({ type: "youtube" });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
