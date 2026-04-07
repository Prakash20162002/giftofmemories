import mongoose from "mongoose";

const PageHeroSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      enum: ["services", "shop", "blog", "contact", "about"],
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    description: {
      type: String,
    },
    breadcrumb: {
      type: String,
    },
    backgroundImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PageHero = mongoose.model("PageHero", PageHeroSchema);
