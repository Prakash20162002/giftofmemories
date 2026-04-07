import { Service } from "../Model/Service.js";
import { Gallery } from "../Model/Gallery.js";
import { Enquiry } from "../Model/Enquiry.js";
// Removed the deleted Reminder import
import { BookingReminder } from "../Model/BookingReminder.js"; 
import nodemailer from "nodemailer";

export const getMetrics = async (req, res) => {
  try {
    const servicesCount = await Service.countDocuments();
    const galleryCount = await Gallery.countDocuments();
    const enquiriesCount = await Enquiry.countDocuments();
    
    // Updated to count the new BookingReminder model
    const remindersCount = await BookingReminder.countDocuments();

    res.status(200).json({
      services: servicesCount,
      gallery: galleryCount,
      enquiries: enquiriesCount,
      reminders: remindersCount, // This now reflects active WhatsApp reminders
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body;
    if (!to)
      return res
        .status(400)
        .json({ message: "Recipient email (to) is required" });

    const subject = "[Test] Gift of Memories - Test Email";
    const html = `<p>This is a test email from the Gift of Memories application.</p>`;

    let emailInfo = null;

    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      emailInfo = { sent: true, messageId: info.messageId };
      if (nodemailer.getTestMessageUrl) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) emailInfo.preview = preview;
      }
    } else if (process.env.NODE_ENV !== "production") {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || testAccount.user,
        to,
        subject,
        html,
      });
      const preview = nodemailer.getTestMessageUrl(info);
      emailInfo = { sent: true, messageId: info.messageId, preview };
    } else {
      return res
        .status(400)
        .json({ message: "SMTP not configured in production" });
    }

    res.status(200).json({ message: "Test email sent", emailInfo });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};