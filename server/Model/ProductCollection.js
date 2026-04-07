import mongoose from "mongoose";

const ProductCollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayStyle: {
      type: String,
      enum: ["grid", "carousel", "featured"],
      default: "grid",
    },
  },
  {
    timestamps: true,
  },
);

export const ProductCollection = mongoose.model(
  "ProductCollection",
  ProductCollectionSchema,
);
