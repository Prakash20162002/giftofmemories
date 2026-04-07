import mongoose from "mongoose";

const HomepageGallerySchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ["parallax", "scroll", "stacked"],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "Gallery Image",
    },
    category: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const HomepageGallery = mongoose.model(
  "HomepageGallery",
  HomepageGallerySchema,
);
