import mongoose from "mongoose";
const GallerySchema = new mongoose.Schema({
  url: String,
  type: { type: String, enum: ["image", "video", "youtube"] },
  tags: [String],
  title: String,
  youtubeId: String,
});
export const Gallery = mongoose.model("Gallery", GallerySchema);
