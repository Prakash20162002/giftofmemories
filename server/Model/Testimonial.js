import mongoose from "mongoose";
const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    feedback: { type: String, required: true },
    title: { type: String },
  },
  { timestamps: true }
);
export const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
