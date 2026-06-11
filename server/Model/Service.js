import mongoose from "mongoose";
const ServiceSchema = new mongoose.Schema({
  title: String,
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  category: String,
  shortDescription: String,
  description: String,
  price: String,
  images: [String],
  logo: String,
  details: {
    duration: String,
    deliverables: String,
    location: String,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  },
  youtubeUrl: {
    type: String,
    default: "",
  },
  showVideoAsFloating: {
    type: Boolean,
    default: false,
  },
});

export const Service = mongoose.model("Service", ServiceSchema);
