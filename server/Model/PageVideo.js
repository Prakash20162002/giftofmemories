import mongoose from "mongoose";

const PageVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    videoType: {
      type: String,
      enum: ["upload", "youtube"],
      required: true,
    },
    youtubeId: {
      type: String,
      default: "",
    },
    pageType: {
      type: String,
      enum: [
        "services",
        "shop",
        "booking",
        "service-details",
        "product-details",
      ],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const PageVideo = mongoose.model("PageVideo", PageVideoSchema);
