import { Package } from "../Model/Package.js";
import { Service } from "../Model/Service.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Get all packages (without services) - public
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all packages with their services nested
export const getPackagesWithServices = async (req, res) => {
  try {
    const packages = await Package.find().sort({ order: 1, createdAt: 1 });
    const packageIds = packages.map((p) => p._id);

    const services = await Service.find({ package: { $in: packageIds } });

    const servicesByPackage = services.reduce((acc, service) => {
      const key = service.package?.toString();
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(service);
      return acc;
    }, {});

    const result = packages.map((pkg) => {
      const pkgObj = pkg.toObject();
      return {
        ...pkgObj,
        services: servicesByPackage[pkg._id.toString()] || [],
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get most booked packages with their services nested - public
export const getMostBookedPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isMostBooked: true }).sort({
      order: 1,
      createdAt: 1,
    });
    const packageIds = packages.map((p) => p._id);

    const services = await Service.find({ package: { $in: packageIds } });

    const servicesByPackage = services.reduce((acc, service) => {
      const key = service.package?.toString();
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(service);
      return acc;
    }, {});

    const result = packages.map((pkg) => {
      const pkgObj = pkg.toObject();
      return {
        ...pkgObj,
        services: servicesByPackage[pkg._id.toString()] || [],
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Admin: create a package
export const addPackage = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startingPrice,
      isFeatured,
      isMostBooked,
      order,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    let imageUrl = "";

    // Upload image to Cloudinary if provided
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "packages" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      imageUrl = await uploadPromise;
    }

    const newPackage = new Package({
      title,
      description,
      category,
      image: imageUrl,
      startingPrice,
      isFeatured,
      isMostBooked,
      order,
    });

    await newPackage.save();

    res.status(201).json({
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Admin: update a package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      startingPrice,
      isFeatured,
      isMostBooked,
      order,
    } = req.body;

    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (startingPrice !== undefined) updateData.startingPrice = startingPrice;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isMostBooked !== undefined) updateData.isMostBooked = isMostBooked;
    if (order !== undefined) updateData.order = order;

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (existingPackage.image) {
        const publicId = existingPackage.image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.log("Error deleting old image:", err);
        }
      }

      // Upload new image
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "packages" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      updateData.image = await uploadPromise;
    }

    const updatedPackage = await Package.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Package updated successfully",
      package: updatedPackage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Admin: delete a package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Package.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Delete image from Cloudinary if exists
    if (existing.image) {
      const publicId = existing.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Error deleting image:", err);
      }
    }

    // Optional: set package field to null on related services
    await Service.updateMany({ package: id }, { $unset: { package: "" } });

    await Package.findByIdAndDelete(id);

    res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
