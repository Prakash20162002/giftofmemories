import mongoose from "mongoose";
import dotenv from "dotenv";
import { HomepageGallery } from "./Model/HomepageGallery.js";
import { ClientGallery } from "./Model/ClientGallery.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const homepageItems = await HomepageGallery.find({});
  console.log("\n--- HomepageGallery Items ---");
  homepageItems.forEach(item => {
    console.log({
      id: item._id,
      alt: item.alt,
      section: item.section,
      category: item.category,
      clientGalleryId: item.clientGalleryId
    });
  });

  const clientItems = await ClientGallery.find({});
  console.log("\n--- ClientGallery Items ---");
  clientItems.forEach(item => {
    console.log({
      id: item._id,
      name: item.name,
      category: item.category,
      imagesCount: item.images?.length
    });
  });

  await mongoose.disconnect();
}

run().catch(console.error);
