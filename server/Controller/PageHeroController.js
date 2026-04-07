import { PageHero } from "../Model/PageHero.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Default hero content for each page
const defaultHeroes = {
  services: {
    title: "Our Photography Services",
    subtitle: "Services",
    description:
      "Crafted experiences for weddings, events, portraits and brands. We turn moments into timeless memories.",
    breadcrumb: "Gift of memories • Services",
    backgroundImage: "",
  },
  shop: {
    title: "Premium Products",
    subtitle: "Shop",
    description:
      "Preserve your memories with our premium photo prints, albums, frames, and unique merchandise.",
    breadcrumb: "Gift of memories • Shop",
    backgroundImage: "",
  },
  blog: {
    title: "Our Blog",
    subtitle: "Blog",
    description:
      "Stories, tips, and inspiration from behind the lens. Discover the art of capturing memories.",
    breadcrumb: "Gift of memories • Blog",
    backgroundImage: "",
  },
  contact: {
    title: "Book Your Session",
    subtitle: "Contact",
    description:
      "Ready to create beautiful memories? Get in touch with us to discuss your photography needs.",
    breadcrumb: "Gift of memories • Contact",
    backgroundImage: "",
  },
};

// Get hero for a specific page (public)
export const getPageHero = async (req, res) => {
  try {
    const { page } = req.params;

    if (!["services", "shop", "blog", "contact", "about"].includes(page)) {
      return res.status(400).json({ message: "Invalid page name" });
    }

    let hero = await PageHero.findOne({ page });

    // Return default if no custom hero exists
    if (!hero) {
      return res.status(200).json({
        page,
        ...defaultHeroes[page],
        isDefault: true,
      });
    }

    res.status(200).json(hero);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all page heroes (admin)
export const getAllPageHeroes = async (req, res) => {
  try {
    const heroes = await PageHero.find();

    // Merge with defaults for pages without custom heroes
    const allPages = ["services", "shop", "blog", "contact", "about"];
    const result = allPages.map((page) => {
      const existing = heroes.find((h) => h.page === page);
      if (existing) {
        return existing;
      }
      return {
        page,
        ...defaultHeroes[page],
        isDefault: true,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create or update page hero (admin)
export const upsertPageHero = async (req, res) => {
  try {
    const { page } = req.params;
    const { title, subtitle, description, breadcrumb } = req.body;

    if (!["services", "shop", "blog", "contact", "about"].includes(page)) {
      return res.status(400).json({ message: "Invalid page name" });
    }

    let imageUrl = null;

    // Handle image upload
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "page-heroes",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    let hero = await PageHero.findOne({ page });

    if (hero) {
      // Update existing
      if (title) hero.title = title;
      if (subtitle !== undefined) hero.subtitle = subtitle;
      if (description !== undefined) hero.description = description;
      if (breadcrumb !== undefined) hero.breadcrumb = breadcrumb;

      if (imageUrl) {
        // Delete old image from cloudinary
        if (hero.backgroundImage) {
          const urlParts = hero.backgroundImage.split("/");
          const publicIdWithExtension = urlParts.slice(-2).join("/");
          const publicId = publicIdWithExtension.split(".")[0];
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        }
        hero.backgroundImage = imageUrl;
      }

      await hero.save();
    } else {
      // Create new
      hero = new PageHero({
        page,
        title: title || defaultHeroes[page].title,
        subtitle: subtitle || defaultHeroes[page].subtitle,
        description: description || defaultHeroes[page].description,
        breadcrumb: breadcrumb || defaultHeroes[page].breadcrumb,
        backgroundImage: imageUrl || "",
      });
      await hero.save();
    }

    res.status(200).json({
      message: "Page hero updated successfully",
      hero,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reset page hero to default (admin)
export const resetPageHero = async (req, res) => {
  try {
    const { page } = req.params;

    if (!["services", "shop", "blog", "contact", "about"].includes(page)) {
      return res.status(400).json({ message: "Invalid page name" });
    }

    const hero = await PageHero.findOne({ page });

    if (hero) {
      // Delete image from cloudinary
      if (hero.backgroundImage) {
        const urlParts = hero.backgroundImage.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }

      await PageHero.deleteOne({ page });
    }

    res.status(200).json({
      message: "Page hero reset to default",
      hero: {
        page,
        ...defaultHeroes[page],
        isDefault: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
