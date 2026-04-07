import Lead from '../Model/Lead.js';
import { sendWhatsAppMessage } from '../whatsapp/whatsapp.js';

// Helper function to create the safe 3-second delay between messages
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. Capture a new lead from the landing page
export const createLead = async (req, res) => {
  try {
    const { name, num, email } = req.body;
    
    if (!name || !num) {
      return res.status(400).json({ success: false, message: "Name and phone number are required" });
    }

    await Lead.create({ name, phone: num, email });
    res.json({ success: true, message: "Lead captured successfully!" });
  } catch (err) {
    console.error("✗ Error saving lead:", err);
    res.status(500).json({ success: false, message: "Server error saving lead" });
  }
};

// 2. Get all leads for the Admin Dashboard
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

// 3. Broadcast Campaign Logic
export const broadcastCampaign = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message content is required" });
  }

  try {
    // Find all leads that haven't received a message yet
    const pendingLeads = await Lead.find({ status: 'pending' });

    if (pendingLeads.length === 0) {
      return res.json({ success: true, message: "No pending leads to message." });
    }

    // Tell the frontend the campaign has started so it doesn't freeze waiting for it to finish!
    res.json({ success: true, message: `Campaign started for ${pendingLeads.length} leads.` });

    // Run the sending process in the background
    (async () => {
      console.log(`[Broadcast] Starting campaign for ${pendingLeads.length} leads...`);
      
      for (const lead of pendingLeads) {
        // Personalize the message
        const finalMessage = message.replace(/{name}/g, lead.name);
        
        console.log(`  ✉ Sending broadcast to ${lead.name} (${lead.phone})...`);
        const success = await sendWhatsAppMessage(lead.phone, finalMessage);
        
        if (success) {
          lead.status = 'sent';
          await lead.save();
          console.log(`  ✓ Status updated to 'sent' for ${lead.name}`);
        } else {
          lead.status = 'failed';
          await lead.save();
          console.log(`  ✗ Failed to send to ${lead.name}`);
        }

        // The crucial 3-second delay to prevent WhatsApp bans
        await delay(3000); 
      }
      
      console.log("[Broadcast] Campaign complete!");
    })();

  } catch (err) {
    console.error("✗ Error starting broadcast:", err);
    // Only send an error response if we haven't already responded
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to start campaign" });
    }
  }
};