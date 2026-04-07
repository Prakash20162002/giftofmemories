import mongoose from "mongoose";
const ServiceSchema = new mongoose.Schema({
  title: String,
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
});

export const Service = mongoose.model("Service", ServiceSchema);
