import mongoose from "mongoose";

const ClientGallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "Wedding",
    },
    coverImage: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const ClientGallery = mongoose.model("ClientGallery", ClientGallerySchema);
