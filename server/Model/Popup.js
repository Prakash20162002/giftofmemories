import mongoose from "mongoose";
const PopupSchema = new mongoose.Schema(
  {
    image: String,
    message: String,
    delay: {
      type: Number,
      default: 3000,
    },
    link: String,
  },
  {
    timestamps: true,
  }
);

export const Popup = mongoose.model("Popup", PopupSchema);
