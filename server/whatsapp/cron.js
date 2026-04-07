import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import ReminderJob from "../Model/ReminderJob.js"; 
import Lead from "../Model/Lead.js"; // <-- ADD THIS IMPORT
import { sendWhatsAppMessage } from "./whatsapp.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cron.schedule("* * * * *", async () => {
  try {
    // ==========================================
    // 1. EXISTING BOOKING REMINDER LOGIC
    // ==========================================
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const jobs = await ReminderJob.find({ status: 'pending', send_time: currentTime })
                                  .populate('booking_id');

    for (const job of jobs) {
      if (!job.booking_id) continue;

      const eventDate = new Date(job.booking_id.event_date);
      const targetDate = new Date(eventDate);
      targetDate.setDate(targetDate.getDate() - job.days_before);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate.getTime() === today.getTime()) {
        const { message, image, recipient_name, recipient_phone, days_before } = job;
        
        let finalMessage = (message || "")
          .replace(/{name}/g, recipient_name)
          .replace(/{date}/g, eventDate.toISOString().split("T")[0])
          .replace(/{days}/g, days_before);

        const imagePath = image ? path.join(__dirname, "../uploads", image) : null;
        const phones = recipient_phone.split(',').map(p => p.trim());
        let anySuccess = false;

        for (const p of phones) {
          const success = await sendWhatsAppMessage(p, finalMessage, imagePath);
          if (success) anySuccess = true;
        }

        job.status = anySuccess ? 'sent' : 'failed';
        job.sent_at = new Date();
        await job.save();
        
        console.log(`✓ Processed ${days_before}-day reminder for ${recipient_name}: ${job.status}`);
      }
    }

    // ==========================================
    // 2. NEW: 1-HOUR LEAD FOLLOW-UP LOGIC
    // ==========================================
    // Find exactly 1 hour ago, and 61 minutes ago to create a 1-minute search window
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const sixtyOneMinsAgo = new Date(Date.now() - 61 * 60 * 1000);

    // Look for pending leads created exactly 1 hour ago
    const pendingLeads = await Lead.find({
      status: 'pending',
      createdAt: { $lte: oneHourAgo, $gt: sixtyOneMinsAgo }
    });

    const FOLLOW_UP_TEMPLATE = `Hello {name}! 👋\n\nThank you for your interest. We noticed you reached out an hour ago and wanted to follow up.\n\nWe'd love to connect with you and discuss how we can help. Feel free to reply to this message or call us anytime.\n\nLooking forward to hearing from you! 😊`;

    for (const lead of pendingLeads) {
      const message = FOLLOW_UP_TEMPLATE.replace("{name}", lead.name);
      console.log(`[Scheduler] ✉ Sending 1-hour follow-up to ${lead.phone}...`);
      
      const success = await sendWhatsAppMessage(lead.phone, message);
      
      if (success) {
        lead.status = 'sent';
        await lead.save();
        console.log(`[Scheduler] ✓ Follow-up sent to ${lead.name}`);
      } else {
        console.log(`[Scheduler] ✗ Failed to send follow-up to ${lead.name}`);
      }
    }

  } catch (err) {
    console.error("✗ Error in cron job:", err);
  }
});

console.log("✓ WhatsApp Cron jobs initialized (MongoDB Connected)");