import { Popup } from "../Model/Popup.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const addPopup = async (req, res) => {
  try {
    const { message, delay, link } = req.body;

    if (!message && !req.file) {
      return res.status(400).json({ message: "Message or Image is required" });
    }

    let imageUrl = null;
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "popup",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    const newPopup = new Popup({
      image: imageUrl,
      message,
      delay: delay || 3000,
      link,
    });

    await newPopup.save();
    res.status(201).json({
      message: "Popup created successfully",
      popup: newPopup,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getPopup = async (req, res) => {
  try {
    const popup = await Popup.find().sort({ createdAt: -1 }).limit(1);

    if (!popup || popup.length === 0) {
      return res.status(404).json({ message: "No popup found" });
    }

    res.status(200).json(popup[0]);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updatePopup = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, delay, link } = req.body;

    const updateData = { message, delay, link };
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "popup",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;
      const oldPopup = await Popup.findById(id);
      if (oldPopup && oldPopup.image) {
        const urlParts = oldPopup.image.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      }

      updateData.image = result.secure_url;
    }

    const updatedPopup = await Popup.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPopup) {
      return res.status(404).json({ message: "Popup not found" });
    }

    res.status(200).json({
      message: "Popup updated successfully",
      popup: updatedPopup,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
