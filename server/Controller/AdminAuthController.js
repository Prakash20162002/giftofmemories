import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../Model/Admin.js";
export const AdminLogin = async (req, res) => {
  try {
    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin)
      return res.status(400).json({ Message: "Invalid email or password" });
    let isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) return res.status(401).json({ Message: "Invalid password" });
    let token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res
      .cookie("adminToken", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({ success: true });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const AdminLogout = (req, res) => {
  try {
    res.clearCookie("adminToken").json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
export const AdminRegister = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count >= 1) {
      return res.status(403).send("Admin account already created");
    }
    const hashed = await bcrypt.hash(req.body.password, 10);
    await Admin.create({
      email: req.body.email.toLowerCase(),
      password: hashed,
    });
    res.json({ message: "Admin account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const VerifyAdmin = async (req, res) => {
  try {
    const token = req.cookies.adminToken;
    if (!token) return res.json({ isLoggedIn: false });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.json({ isLoggedIn: false });
      try {
        const admin = await Admin.findById(decoded.id).select("name email");
        return res.json({
          isLoggedIn: true,
          adminId: decoded.id,
          admin: admin ? { name: admin.name, email: admin.email } : null,
        });
      } catch (e) {
        return res.json({ isLoggedIn: true, adminId: decoded.id });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
