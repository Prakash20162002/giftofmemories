import { About } from "../Model/About.js";
import cloudinary from "../config/cloudinary.js";

// Get About Content
export const getAboutContent = async (req, res) => {
  try {
    let about = await About.findOne();

    // If no about content exists, create default
    if (!about) {
      about = await About.create({
        storyImage: "https://via.placeholder.com/800x1000",
        storyTitle: "Crafting Memories Since 2016",
        storyContent:
          "It started with a simple belief: that the most beautiful moments in life are fleeting. Our mission from day one has been to freeze time, not just visually, but emotionally, ensuring that every laugh, tear, and quiet glance is tangible heritage. Over the years, we have grown from a small studio into a collective of passionate visual storytellers. Whether it's the grandeur of a wedding or the raw intimacy of a portrait, our approach remains the same—observe with empathy, shoot with precision, and edit with love. Our work is not just about perfect lighting or composition; it's about the connection we build with you. We strive to be invisible observers, letting your story unfold naturally while ensuring no detail is missed.",
        storySignature: "- Gift of Memories Team",
        teamMembers: [],
      });
    }

    res.status(200).json(about);
  } catch (error) {
    console.error("Error fetching about content:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch about content", error: error.message });
  }
};

// Update Story Section
export const updateStorySection = async (req, res) => {
  try {
    const { storyTitle, storyContent, storySignature } = req.body;
    let storyImage;

    let about = await About.findOne();
    if (!about) {
      about = new About({});
    }

    // Handle image upload if provided
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (about.storyImage && about.storyImage.includes("cloudinary")) {
        const publicId = about.storyImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`about/${publicId}`);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "about",
        transformation: [{ width: 800, height: 1000, crop: "fill" }],
      });
      storyImage = result.secure_url;
    }

    // Update fields
    if (storyImage) about.storyImage = storyImage;
    if (storyTitle) about.storyTitle = storyTitle;
    if (storyContent) about.storyContent = storyContent;
    if (storySignature) about.storySignature = storySignature;

    await about.save();

    res
      .status(200)
      .json({ message: "Story section updated successfully", about });
  } catch (error) {
    console.error("Error updating story section:", error);
    res
      .status(500)
      .json({
        message: "Failed to update story section",
        error: error.message,
      });
  }
};

// Add Team Member
export const addTeamMember = async (req, res) => {
  try {
    const { name, designation, quote } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Team member image is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "about/team",
      transformation: [{ width: 500, height: 500, crop: "fill" }],
    });

    let about = await About.findOne();
    if (!about) {
      about = new About({
        storyImage: "https://via.placeholder.com/800x1000",
        storyTitle: "Crafting Memories Since 2016",
        storyContent: "Default content",
        teamMembers: [],
      });
    }

    // Add team member
    about.teamMembers.push({
      name,
      designation,
      quote,
      image: result.secure_url,
      order: about.teamMembers.length,
    });

    await about.save();

    res.status(201).json({ message: "Team member added successfully", about });
  } catch (error) {
    console.error("Error adding team member:", error);
    res
      .status(500)
      .json({ message: "Failed to add team member", error: error.message });
  }
};

// Update Team Member
export const updateTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, designation, quote } = req.body;

    let about = await About.findOne();
    if (!about) {
      return res.status(404).json({ message: "About content not found" });
    }

    const member = about.teamMembers.id(memberId);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Handle image upload if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (member.image && member.image.includes("cloudinary")) {
        const publicId = member.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`about/team/${publicId}`);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "about/team",
        transformation: [{ width: 500, height: 500, crop: "fill" }],
      });
      member.image = result.secure_url;
    }

    // Update fields
    if (name) member.name = name;
    if (designation) member.designation = designation;
    if (quote) member.quote = quote;

    await about.save();

    res
      .status(200)
      .json({ message: "Team member updated successfully", about });
  } catch (error) {
    console.error("Error updating team member:", error);
    res
      .status(500)
      .json({ message: "Failed to update team member", error: error.message });
  }
};

// Delete Team Member
export const deleteTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    let about = await About.findOne();
    if (!about) {
      return res.status(404).json({ message: "About content not found" });
    }

    const member = about.teamMembers.id(memberId);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Delete image from Cloudinary
    if (member.image && member.image.includes("cloudinary")) {
      const publicId = member.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`about/team/${publicId}`);
    }

    // Remove team member
    about.teamMembers.pull(memberId);
    await about.save();

    res
      .status(200)
      .json({ message: "Team member deleted successfully", about });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res
      .status(500)
      .json({ message: "Failed to delete team member", error: error.message });
  }
};
