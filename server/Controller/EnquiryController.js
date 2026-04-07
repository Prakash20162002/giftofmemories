import { Enquiry } from "../Model/Enquiry.js";
import nodemailer from "nodemailer";
export const postEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      eventType,
      eventDate,
      message,
      source,
      status,
    } = req.body;
    if (!name || !email || !phone || !eventType || !eventDate || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ""))) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid event date" });
    }
    const newEnquiry = new Enquiry({
      name,
      email,
      phone,
      eventType,
      eventDate: parsedDate,
      message,
      // If client doesn't send these, model defaults will apply
      source: source || "website",
      status: status || "pending",
    });
    await newEnquiry.save();
    res.status(201).json({
      message: "Enquiry submitted successfully",
      enquiry: newEnquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const exportEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    const csvHeader =
      "Name,Email,Phone,EventType,EventDate,Message,Source,Status,CreatedAt\n";
    const csvRows = enquiries
      .map((enquiry) => {
        const name = `"${enquiry.name || ""}"`;
        const email = `"${enquiry.email || ""}"`;
        const phone = `"${enquiry.phone || ""}"`;
        const eventType = `"${enquiry.eventType || ""}"`;
        const eventDate = `"${
          enquiry.eventDate
            ? new Date(enquiry.eventDate).toISOString().split("T")[0]
            : ""
        }"`;
        const message = `"${(enquiry.message || "").replace(/"/g, '""')}"`;
        const source = `"${enquiry.source || "website"}"`;
        const status = `"${enquiry.status || "pending"}"`;
        const createdAt = `"${
          enquiry.createdAt ? new Date(enquiry.createdAt).toISOString() : ""
        }"`;
        return `${name},${email},${phone},${eventType},${eventDate},${message},${source},${status},${createdAt}`;
      })
      .join("\n");
    const csv = csvHeader + csvRows;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enquiries-${Date.now()}.csv`
    );
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
    res.status(200).json(enquiry);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const allowed = ["pending", "approved", "rejected", "responded", "new"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });

    enquiry.status = status;
    enquiry.adminFeedback = feedback || "";

    await enquiry.save();

    // Send email to user if SMTP configured or when in development use Ethereal test account
    let emailInfo = null;
    const subject = `Your enquiry has been ${status}`;
    const html = `
      <p>Hi ${enquiry.name},</p>
      <p>Your enquiry submitted on ${
        enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : ""
      } has been <strong>${status}</strong>.</p>
      <p><strong>Feedback from admin:</strong></p>
      <p>${feedback ? feedback.replace(/\n/g, "<br/>") : "(no feedback)"}</p>
      <hr />
      <p>This message was sent by the Gift of Memories admin team.</p>
    `;

    try {
      if (process.env.SMTP_HOST) {
        // Real SMTP
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        const info = await transporter.sendMail({
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to: enquiry.email,
          subject,
          html,
        });
        emailInfo = {
          sent: true,
          to: enquiry.email,
          messageId: info.messageId,
        };
        // if using a service that provides a preview URL
        if (nodemailer.getTestMessageUrl && info) {
          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) emailInfo.preview = preview;
        }
      } else if (process.env.NODE_ENV !== "production") {
        // Create Ethereal test account for dev to preview emails
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await transporter.sendMail({
          from: process.env.FROM_EMAIL || testAccount.user,
          to: enquiry.email,
          subject,
          html,
        });
        const preview = nodemailer.getTestMessageUrl(info);
        emailInfo = {
          sent: true,
          to: enquiry.email,
          messageId: info.messageId,
          preview,
        };
        console.log("Ethereal preview URL:", preview);
      } else {
        console.log("SMTP not configured; skipping email send in production");
        emailInfo = {
          sent: false,
          to: enquiry.email,
          reason: "SMTP not configured",
        };
      }
    } catch (emailError) {
      console.error("Failed to send email", emailError);
      emailInfo = { sent: false, to: enquiry.email, error: emailError.message };
    }

    res.status(200).json({ message: "Status updated", enquiry, emailInfo });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
