import { Service } from "../Model/Service.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const addService = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      price,
      shortDescription,
      details,
      packageId,
    } = req.body;

    if (!title || !category || !price) {
      return res
        .status(400)
        .json({ message: "Title, category, and price are required" });
    }

    let imageUrls = [];
    let logoUrl = null;

    if (req.files) {
      // Handle cover images
      const coverImages = req.files.images || req.files["images"] || [];
      if (coverImages.length > 0) {
        const uploadPromises = coverImages.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "services",
                resource_type: "image",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          });
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      // Handle logo
      const logoFiles = req.files.logo || req.files["logo"] || [];
      if (logoFiles.length > 0) {
        const logoFile = logoFiles[0];
        logoUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "services/logos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(logoFile.buffer).pipe(uploadStream);
        });
      }
    }

    const newService = new Service({
      title,
      category,
      shortDescription,
      description,
      price,
      images: imageUrls,
      logo: logoUrl,
      details: details ? JSON.parse(details) : {},
      package: packageId || null,
    });

    await newService.save();
    res.status(201).json({
      message: "Service added successfully",
      service: newService,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("package", "title");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      price,
      shortDescription,
      details,
      packageId,
    } = req.body;

    const updateData = {
      title,
      category,
      description,
      price,
      shortDescription,
    };

    if (packageId !== undefined) {
      updateData.package = packageId || null;
    }

    if (details) {
      updateData.details = JSON.parse(details);
    }

    if (req.files) {
      // Handle cover images
      const coverImages = req.files.images || req.files["images"] || [];
      if (coverImages.length > 0) {
        const uploadPromises = coverImages.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "services",
                resource_type: "image",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          });
        });

        const newImageUrls = await Promise.all(uploadPromises);

        const oldService = await Service.findById(id);
        if (oldService && oldService.images && oldService.images.length > 0) {
          const deletePromises = oldService.images.map((imageUrl) => {
            const urlParts = imageUrl.split("/");
            const publicIdWithExtension = urlParts.slice(-2).join("/");
            const publicId = publicIdWithExtension.split(".")[0];
            return cloudinary.uploader.destroy(publicId, {
              resource_type: "image",
            });
          });

          await Promise.all(deletePromises);
        }

        updateData.images = newImageUrls;
      }

      // Handle logo
      const logoFiles = req.files.logo || req.files["logo"] || [];
      if (logoFiles.length > 0) {
        const logoFile = logoFiles[0];
        const logoUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "services/logos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(logoFile.buffer).pipe(uploadStream);
        });

        // Delete old logo if exists
        const oldService = await Service.findById(id);
        if (oldService && oldService.logo) {
          const urlParts = oldService.logo.split("/");
          const publicIdWithExtension = urlParts.slice(-2).join("/");
          const publicId = publicIdWithExtension.split(".")[0];
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        }

        updateData.logo = logoUrl;
      }
    }

    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (deletedService.images && deletedService.images.length > 0) {
      const deletePromises = deletedService.images.map((imageUrl) => {
        const urlParts = imageUrl.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        return cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      });

      await Promise.all(deletePromises);
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
