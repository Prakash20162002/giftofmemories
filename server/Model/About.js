import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema(
  {
    // Story Section (Crafting Memories)
    storyImage: {
      type: String,
      required: [true, "Story image is required"],
    },
    storyTitle: {
      type: String,
      required: [true, "Story title is required"],
      default: "Crafting Memories Since 2016",
    },
    storyContent: {
      type: String,
      required: [true, "Story content is required"],
    },
    storySignature: {
      type: String,
      default: "- Gift of Memories Team",
    },

    // Team Members
    teamMembers: [
      {
        name: {
          type: String,
          required: [true, "Team member name is required"],
        },
        designation: {
          type: String,
          required: [true, "Team member designation is required"],
        },
        quote: {
          type: String,
          required: [true, "Team member quote is required"],
        },
        image: {
          type: String,
          required: [true, "Team member image is required"],
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const About = mongoose.model("About", AboutSchema);
