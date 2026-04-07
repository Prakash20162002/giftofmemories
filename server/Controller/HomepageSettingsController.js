import { HomepageSettings } from "../Model/HomepageSettings.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Get homepage settings (public)
export const getHomepageSettings = async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await HomepageSettings.create({
        showProducts: true,
        showServices: true,
        showGallery: true,
        showTestimonials: true,
        showScrollGallery: true,
        showStackedGallery: true,
        showHomeVideo: true,
        homeVideos: [],
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update homepage settings (admin only)
export const updateHomepageSettings = async (req, res) => {
  try {
    const {
      showProducts,
      showServices,
      showGallery,
      showTestimonials,
      showScrollGallery,
      showStackedGallery,
      showHomeVideo,
    } = req.body;

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      settings = new HomepageSettings({
        showProducts,
        showServices,
        showGallery,
        showTestimonials,
        showScrollGallery,
        showStackedGallery,
        showHomeVideo,
      });
    } else {
      if (typeof showProducts === "boolean")
        settings.showProducts = showProducts;
      if (typeof showServices === "boolean")
        settings.showServices = showServices;
      if (typeof showGallery === "boolean") settings.showGallery = showGallery;
      if (typeof showTestimonials === "boolean")
        settings.showTestimonials = showTestimonials;
      if (typeof showScrollGallery === "boolean")
        settings.showScrollGallery = showScrollGallery;
      if (typeof showStackedGallery === "boolean")
        settings.showStackedGallery = showStackedGallery;
      if (typeof showHomeVideo === "boolean")
        settings.showHomeVideo = showHomeVideo;
    }

    await settings.save();

    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Toggle a specific section visibility
export const toggleSectionVisibility = async (req, res) => {
  try {
    const { section } = req.params;

    const validSections = [
      "showProducts",
      "showServices",
      "showGallery",
      "showTestimonials",
      "showScrollGallery",
      "showStackedGallery",
      "showHomeVideo",
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      settings = new HomepageSettings();
    }

    settings[section] = !settings[section];
    await settings.save();

    res.status(200).json({
      message: `${section} visibility toggled successfully`,
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add home video (YouTube)
export const addHomeVideoYoutube = async (req, res) => {
  try {
    const { youtubeUrl, title, description } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ message: "YouTube URL is required" });
    }

    // Extract YouTube video ID
    let youtubeId = "";
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = youtubeUrl.match(youtubeRegex);

    if (match && match[1]) {
      youtubeId = match[1];
    } else {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      settings = new HomepageSettings();
    }

    const newVideo = {
      type: "youtube",
      url: youtubeUrl,
      youtubeId,
      title: title || "",
      description: description || "",
      thumbnailUrl,
      order: settings.homeVideos.length,
    };

    settings.homeVideos.push(newVideo);
    await settings.save();

    res.status(200).json({
      message: "Home video added successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add home video (Upload)
export const addHomeVideoUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const { title, description } = req.body;

    // Upload video to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "home-video",
          resource_type: "video",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      settings = new HomepageSettings();
    }

    const newVideo = {
      type: "upload",
      url: result.secure_url,
      youtubeId: "",
      title: title || "",
      description: description || "",
      thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
      order: settings.homeVideos.length,
    };

    settings.homeVideos.push(newVideo);
    await settings.save();

    res.status(200).json({
      message: "Home video uploaded successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete home video by ID
export const deleteHomeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const videoToDelete = settings.homeVideos.id(videoId);

    if (!videoToDelete) {
      return res.status(404).json({ message: "Video not found" });
    }

    // If it's an uploaded video, delete from Cloudinary
    if (videoToDelete.type === "upload" && videoToDelete.url) {
      try {
        const urlParts = videoToDelete.url.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }
    }

    settings.homeVideos.pull(videoId);
    await settings.save();

    res.status(200).json({
      message: "Home video deleted successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update video order
export const updateVideoOrder = async (req, res) => {
  try {
    const { videos } = req.body; // Array of { id, order }

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ message: "Invalid videos array" });
    }

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    videos.forEach(({ id, order }) => {
      const video = settings.homeVideos.id(id);
      if (video) {
        video.order = order;
      }
    });

    // Sort by order
    settings.homeVideos.sort((a, b) => a.order - b.order);
    await settings.save();

    res.status(200).json({
      message: "Video order updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Legacy support - kept for compatibility
export const updateHomeVideoYoutube = addHomeVideoYoutube;
export const updateHomeVideoUpload = addHomeVideoUpload;
