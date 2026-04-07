import mongoose from "mongoose";
const PackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    image: {
      type: String,
    },
    startingPrice: {
      type: Number,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isMostBooked: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Package = mongoose.model("Package", PackageSchema);
