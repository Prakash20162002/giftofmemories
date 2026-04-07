import { getStatus, getQr, sendWhatsAppMessage } from "../whatsapp.js";
import { Enquiry } from "../Model/Enquiry.js";

// Get Connection Status & QR
export const getWhatsAppStatus = async (req, res) => {
  res.json({
    status: getStatus(),
    qr: getQr()
  });
};

// Start Broadcast Campaign
export const startCampaign = async (req, res) => {
  const { message, leadIds } = req.body; // leadIds is an array of MongoDB IDs

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // Find selected leads or all pending enquiries
    const filter = leadIds ? { _id: { $in: leadIds } } : { status: "pending" };
    const leads = await Enquiry.find(filter);

    if (leads.length === 0) return res.status(404).json({ error: "No leads found" });

    // Send the response immediately so the frontend can start polling progress
    res.status(202).json({ message: "Campaign started", total: leads.length });

    // Execute sending in the background (Async loop)
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (const lead of leads) {
      const personalMessage = message.replace(/{name}/g, lead.name);
      
      const result = await sendWhatsAppMessage(lead.phone, personalMessage);
      
      if (result.success) {
        lead.status = "contacted"; // Update status in MongoDB
        await lead.save();
      }

      // 3 second safety delay between messages (like your Python code)
      await delay(3000);
    }

  } catch (error) {
    console.error("Campaign Error:", error);
  }
};