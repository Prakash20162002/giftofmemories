import { Offer } from "../Model/Offer.js";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "offers" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// GET: Returns an ARRAY of all active offers
export const getActiveOffer = async (req, res) => {
  try {
    const activeOffers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(activeOffers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active offers" });
  }
};

export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offers" });
  }
};

export const createOffer = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const imageUrl = await uploadToCloudinary(req.file.buffer);

    // Create the offer (Multiple can be active at once now)
    const newOffer = await Offer.create({
      title,
      description,
      image: imageUrl,
      link,
      isActive: true, 
    });

    res.status(201).json(newOffer);
  } catch (error) {
    res.status(500).json({ message: "Failed to create offer" });
  }
};

export const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Toggle THIS specific offer without touching the others
    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(200).json({ message: "Offer status updated", offer });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle offer" });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete offer" });
  }
};