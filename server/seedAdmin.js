import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Admin } from "./Model/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");

    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin1234", 10);
    const admin = new Admin({
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin created successfully: admin@gmail.com / admin1234");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
