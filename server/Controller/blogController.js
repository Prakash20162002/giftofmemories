import Blog from "../Model/Blog.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

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
    const {
      title,
      excerpt,
      content,
      category,
      date,
      image: manualImage,
    } = req.body;
    let imageUrl = manualImage || "https://via.placeholder.com/800x400"; 

    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "blogs", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    // Auto-generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newBlog = new Blog({
      title,
      excerpt,
      content,
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
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "blogs", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
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
