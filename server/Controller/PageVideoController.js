import { PageVideo } from "../Model/PageVideo.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Get all videos for a specific page
export const getVideosByPage = async (req, res) => {
  try {
    const { pageType } = req.params;
    const videos = await PageVideo.find({ pageType, isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all videos (admin)
export const getAllVideos = async (req, res) => {
  try {
    const videos = await PageVideo.find().sort({
      pageType: 1,
      order: 1,
      createdAt: -1,
    });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add a new video (upload)
export const addVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const { title, description, pageType, order } = req.body;

    if (!title || !pageType) {
      return res
        .status(400)
        .json({ message: "Title and page type are required" });
    }

    // Upload video to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "page-videos",
          resource_type: "video",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    const newVideo = new PageVideo({
      title,
      description: description || "",
      videoUrl: result.secure_url,
      thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
      videoType: "upload",
      pageType,
      order: order ? parseInt(order) : 0,
    });

    await newVideo.save();
    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add YouTube video
export const addYoutubeVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, pageType, order } = req.body;

    if (!title || !youtubeUrl || !pageType) {
      return res
        .status(400)
        .json({ message: "Title, YouTube URL, and page type are required" });
    }

    // Extract YouTube video ID (FIXED TO ACCEPT /live/ AND /shorts/ URLS)
    let youtubeId = "";
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = youtubeUrl.match(youtubeRegex);

    if (match && match[1]) {
      youtubeId = match[1];
    } else {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    const newVideo = new PageVideo({
      title,
      description: description || "",
      videoUrl: youtubeUrl,
      thumbnailUrl,
      videoType: "youtube",
      youtubeId,
      pageType,
      order: order ? parseInt(order) : 0,
    });

    await newVideo.save();
    res.status(201).json({
      message: "YouTube video added successfully",
      video: newVideo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update video
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, pageType, isActive, order } = req.body;

    const video = await PageVideo.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (pageType) video.pageType = pageType;
    if (isActive !== undefined) video.isActive = isActive;
    if (order !== undefined) video.order = parseInt(order);

    // If a new video file is uploaded
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "page-videos",
            resource_type: "video",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;
      video.videoUrl = result.secure_url;
      video.thumbnailUrl = result.secure_url.replace(/\.[^/.]+$/, ".jpg");
      video.videoType = "upload";
      video.youtubeId = "";
    }

    await video.save();
    res.status(200).json({
      message: "Video updated successfully",
      video,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Toggle video active status
export const toggleVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await PageVideo.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.isActive = !video.isActive;
    await video.save();

    res.status(200).json({
      message: `Video ${video.isActive ? "activated" : "deactivated"} successfully`,
      video,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await PageVideo.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // If it's an uploaded video, delete from Cloudinary
    if (video.videoType === "upload" && video.videoUrl) {
      try {
        // Extract public_id from URL
        const urlParts = video.videoUrl.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }
    }

    await PageVideo.findByIdAndDelete(id);
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reorder videos
export const reorderVideos = async (req, res) => {
  try {
    const { videos } = req.body; // Array of { id, order }

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ message: "Invalid videos array" });
    }

    const updatePromises = videos.map(({ id, order }) =>
      PageVideo.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Videos reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};