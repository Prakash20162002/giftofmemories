import mongoose from "mongoose";
import Blog from "../Model/Blog.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import compressImage from "../utils/compressImage.js";

// Get all blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single blog
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, date, image: manualImage } = req.body;
    
    let imageUrl = manualImage || "https://via.placeholder.com/800x400"; 

    if (req.file) {
      const uploadBuffer = await compressImage(req.file.buffer);
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "blogs", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(uploadBuffer).pipe(uploadStream);
      });
      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    // SLUG GENERATION: Optimized for SEO
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    const newBlog = new Blog({
      title,
      excerpt,
      content, // HTML string from Tiptap
      category,
      image: imageUrl,
      date,
      slug,
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      date,
      image: manualImage,
    } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let imageUrl = manualImage || blog.image;

    if (req.file) {
      const uploadBuffer = await compressImage(req.file.buffer);
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "blogs", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(uploadBuffer).pipe(uploadStream);
      });
      const result = await uploadPromise;

      if (blog.image && blog.image.includes("cloudinary")) {
        try {
          const urlParts = blog.image.split("/");
          const publicIdWithExtension = urlParts.slice(-2).join("/"); 
          const publicId = publicIdWithExtension.split(".")[0];
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        } catch (e) {
          console.error("Failed to delete old image", e);
        }
      }

      imageUrl = result.secure_url;
    }

    blog.title = title || blog.title;
    blog.excerpt = excerpt || blog.excerpt;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.image = imageUrl;
    blog.date = date || blog.date;

    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // Logic to delete image from cloudinary
    if (blog.image && blog.image.includes("cloudinary")) {
      try {
        const urlParts = blog.image.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (e) {
        console.error("Failed to delete image", e);
      }
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- SHARE REDIRECT ENDPOINT ---------------- */

/* ---------------- SHARE REDIRECT ENDPOINT ---------------- */

export const getShareBlogPage = async (req, res) => {
  try {
    const { id } = req.params;
    let blog;
    
    // Find blog by ID or Slug
    if (mongoose.Types.ObjectId.isValid(id)) {
      try {
        blog = await Blog.findById(id);
      } catch (err) {
        // Fallback to slug search
      }
    }
    if (!blog) {
      blog = await Blog.findOne({ slug: id });
    }

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const redirectUrl = `https://giftofmemories.in/blog/${blog._id}`;

    // Instant 302 redirect for human browsers; crawlers get the OG HTML
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const CRAWLER_SIGS = [
      "whatsapp", "facebookexternalhit", "facebot", "twitterbot", "linkedinbot",
      "slackbot", "telegrambot", "discordbot", "googlebot", "bingbot",
      "yandexbot", "baiduspider", "embedly", "outbrain", "pinterest",
      "applebot", "ia_archiver", "vkshare", "crawl", "spider", "preview"
    ];
    if (!CRAWLER_SIGS.some((s) => ua.includes(s))) {
      return res.redirect(302, redirectUrl);
    }

    let blogImage = blog.image || "";
    if (blogImage && blogImage.includes("cloudinary.com") && blogImage.includes("/upload/")) {
      blogImage = blogImage.replace("/upload/", "/upload/w_1200,h_630,c_fill,f_jpg,q_auto/");
    }

    const blogTitle = blog.title;
    const blogDescription = blog.excerpt
      ? blog.excerpt.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().substring(0, 160) + "..."
      : `Read "${blogTitle}" on Gift of Memories Journal.`;

    const safeTitle = blogTitle.replace(/"/g, '&quot;');
    const safeDesc = blogDescription.replace(/"/g, '&quot;');
    const safeImage = blogImage.replace(/"/g, '%22');

    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} | Gift of Memories</title>
  <meta name="description" content="${safeDesc}">
  <meta name="robots" content="noindex">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:site_name" content="Gift of Memories">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:secure_url" content="${safeImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${redirectUrl}">
  <link rel="canonical" href="${redirectUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">
  <meta name="twitter:image:alt" content="${safeTitle}">

  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <script>window.location.replace("${redirectUrl}");</script>
</head>
<body style="font-family:sans-serif;text-align:center;padding:40px;background:#FAF9F6;">
  <h2>${safeTitle}</h2>
  <p>Redirecting... <a href="${redirectUrl}">Click here if not redirected</a></p>
</body>
</html>`);
  } catch (error) {
    console.error("Error in getShareBlogPage:", error);
    res.status(500).send("Server Error");
  }
};


