// import mongoose from "mongoose";

// const ShopSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Product name is required"],
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: [true, "Product description is required"],
//     },
//     price: {
//       type: Number,
//       required: [true, "Product price is required"],
//       min: [0, "Price cannot be negative"],
//     },
//     oldPrice: {
//       type: Number,
//       min: [0, "Old price cannot be negative"],
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ProductCategory",
//       required: [true, "Product category is required"],
//     },
//     image: {
//       type: String,
//       required: [true, "Product image is required"],
//     },
//     popularity: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100,
//     },
//     tag:{
//       type: String,
//        default: "new",
//     },
//     isBestseller: {
//       type: Boolean,
//       default: false,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export const Shop = mongoose.model("Shop", ShopSchema);
import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    oldPrice: {
      type: Number,
      min: [0, "Old price cannot be negative"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: [true, "Product category is required"],
    },

    /* ---------------- MEDIA (Images + Videos) ---------------- */

    media: {
      type: [String],
      required: [true, "At least one media file is required"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one media file is required",
      },
    },

    /* ---------------- PRODUCT METADATA ---------------- */

    popularity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    tag: {
      type: String,
      default: "new",
      trim: true,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = mongoose.model("Shop", ShopSchema);