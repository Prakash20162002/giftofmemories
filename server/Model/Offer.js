import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    link: { type: String }, // Optional link (e.g., to /shop or /services)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Offer = mongoose.model("Offer", OfferSchema);