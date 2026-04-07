import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Customer, ScheduledMessage, BookingReminder } from "../Model/index.js";
import { sendWhatsAppMessage, getStatus, getQr } from "../whatsapp/whatsapp.js";
import cloudinary from "cloudinary";
import streamifier from "streamifier";
import { sendBookingReminders, getCurrentISTTimeString, sendScheduledMessages } from "../whatsapp/reminderScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMultiple = upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'reminderImage0', maxCount: 1 }, 
  { name: 'reminderImage1', maxCount: 1 }, 
  { name: 'reminderImage2', maxCount: 1 }, 
  { name: 'reminderImage3', maxCount: 1 }, 
  { name: 'reminderImage4', maxCount: 1 }, 
  { name: 'reminderImage5', maxCount: 1 },
  { name: 'reminderImage6', maxCount: 1 },
  { name: 'reminderImage7', maxCount: 1 },
  { name: 'reminderImage8', maxCount: 1 },
  { name: 'reminderImage9', maxCount: 1 }
]);

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// GET WhatsApp status
router.get("/status", async (req, res) => {
  try {
    const status = getStatus();
    const qr = getQr();
    res.json({ status, qr });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new customer
router.post("/customers", async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ error: "Customer with this phone number already exists" });
    }

    const customer = new Customer({ name, phone, email, notes });
    await customer.save();
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update customer
router.put("/customers/:id", async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if phone number is being changed and if it already exists
    if (phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({ phone });
      if (existingCustomer) {
        return res.status(400).json({ error: "Customer with this phone number already exists" });
      }
    }

    customer.name = name;
    customer.phone = phone;
    customer.email = email;
    customer.notes = notes;
    
    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE customer
router.delete("/customers/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all scheduled messages
router.get("/scheduled-messages", async (req, res) => {
  try {
    const messages = await ScheduledMessage.find()
      .populate('customer', 'name phone')
      .sort({ scheduledDate: 1, scheduledTime: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST schedule new message
router.post("/scheduled-messages", upload.single('image'), async (req, res) => {
  try {
    const { customerId, customerIds, message, scheduledDate, scheduledTime } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    // Handle both single (legacy) and multiple customer IDs
    let targets = [];
    if (customerIds) {
      targets = JSON.parse(customerIds);
    } else if (customerId) {
      targets = [customerId];
    }

    if (targets.length === 0) {
      return res.status(400).json({ error: "No customers selected" });
    }

    const messagesToCreate = targets.map(id => ({
      customer: id,
      message,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      imageUrl
    }));

    const createdMessages = await ScheduledMessage.insertMany(messagesToCreate);
    
    res.status(201).json(createdMessages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update scheduled message
router.put("/scheduled-messages/:id", upload.single('image'), async (req, res) => {
  try {
    const { customerId, customerIds, message, scheduledDate, scheduledTime } = req.body;
    
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    // Handle both single (legacy) and multiple customer IDs
    let targets = [];
    if (customerIds) {
      targets = JSON.parse(customerIds);
    } else if (customerId) {
      targets = [customerId];
    }

    if (targets.length === 0) {
      return res.status(400).json({ error: "No customers selected" });
    }

    // For updates, we'll update the first message and create new ones for additional customers
    const messageId = req.params.id;
    const existingMessage = await ScheduledMessage.findById(messageId);
    
    if (!existingMessage) {
      return res.status(404).json({ error: "Scheduled message not found" });
    }

    // Update the existing message
    existingMessage.customer = targets[0];
    existingMessage.message = message;
    existingMessage.scheduledDate = new Date(scheduledDate);
    existingMessage.scheduledTime = scheduledTime;
    if (imageUrl) existingMessage.imageUrl = imageUrl;
    
    await existingMessage.save();

    // Create additional messages for extra customers
    let createdMessages = [existingMessage];
    if (targets.length > 1) {
      const additionalMessages = targets.slice(1).map(id => ({
        customer: id,
        message,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        imageUrl
      }));
      
      const newMessages = await ScheduledMessage.insertMany(additionalMessages);
      createdMessages = [...createdMessages, ...newMessages];
    }
    
    res.json(createdMessages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE scheduled message
router.delete("/scheduled-messages/:id", async (req, res) => {
  try {
    await ScheduledMessage.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: "Message cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all booking reminders
router.get("/booking-reminders", async (req, res) => {
  try {
    const reminders = await BookingReminder.find()
      .populate('customer', 'name phone')
      .sort({ bookingDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create booking reminder
router.post("/booking-reminders", uploadMultiple, async (req, res) => {
  try {
    const { customerId, bookingDate, customMessage, reminders } = req.body;
    
    // Validate booking date
    const bookingDateObj = new Date(bookingDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (bookingDateObj < currentDate) {
      return res.status(400).json({ error: "Booking date cannot be in the past" });
    }
    
    let customImageUrl = null;
    if (req.files && req.files.image && req.files.image[0]) {
      customImageUrl = await uploadToCloudinary(req.files.image[0].buffer);
    }

    const parsedReminders = JSON.parse(reminders);
    
    // Validate each reminder date
    const validReminders = [];
    for (const reminder of parsedReminders) {
      const reminderDate = new Date(bookingDateObj);
      reminderDate.setDate(reminderDate.getDate() - reminder.daysBefore);
      reminderDate.setHours(0, 0, 0, 0);
      
      if (reminderDate >= currentDate) {
        validReminders.push(reminder);
      } else {
        console.log(`Skipping invalid reminder: ${reminder.daysBefore} days before (date ${reminderDate.toDateString()} is in the past)`);
      }
    }
    
    if (validReminders.length === 0) {
      return res.status(400).json({ error: "No valid reminder dates found for the selected booking date" });
    }
    
    // Handle individual reminder images
    for (let i = 0; i < validReminders.length; i++) {
      const imageKey = `reminderImage${i}`;
      if (req.files && req.files[imageKey] && req.files[imageKey][0]) {
        validReminders[i].imageUrl = await uploadToCloudinary(req.files[imageKey][0].buffer);
      }
    }
    
    const bookingReminder = new BookingReminder({
      customer: customerId,
      bookingDate: new Date(bookingDate),
      customMessage,
      customImageUrl,
      reminders: validReminders
    });

    console.log(`[DEBUG] Creating reminder with customer ID: ${customerId}`);
    console.log(`[DEBUG] Valid reminders: ${validReminders.length}`);

    await bookingReminder.save();
    console.log(`[DEBUG] Reminder saved with ID: ${bookingReminder._id}`);
    
    // Populate customer data after saving
    await bookingReminder.populate('customer', 'name phone');
    console.log(`[DEBUG] Customer populated: ${bookingReminder.customer?.name} (${bookingReminder.customer?.phone})`);
    
    res.status(201).json(bookingReminder);
  } catch (error) {
    console.error('Error creating booking reminder:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update booking reminder
router.put("/booking-reminders/:id", uploadMultiple, async (req, res) => {
  try {
    const { customerId, bookingDate, customMessage, reminders } = req.body;
    
    // Validate booking date
    const bookingDateObj = new Date(bookingDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (bookingDateObj < currentDate) {
      return res.status(400).json({ error: "Booking date cannot be in the past" });
    }
    
    let customImageUrl = req.body.customImageUrl;
    if (req.files && req.files.image && req.files.image[0]) {
      customImageUrl = await uploadToCloudinary(req.files.image[0].buffer);
    }

    const parsedReminders = JSON.parse(reminders);
    
    // Validate each reminder date
    const validReminders = [];
    for (const reminder of parsedReminders) {
      const reminderDate = new Date(bookingDateObj);
      reminderDate.setDate(reminderDate.getDate() - reminder.daysBefore);
      reminderDate.setHours(0, 0, 0, 0);
      
      if (reminderDate >= currentDate) {
        validReminders.push(reminder);
      } else {
        console.log(`Skipping invalid reminder: ${reminder.daysBefore} days before (date ${reminderDate.toDateString()} is in the past)`);
      }
    }
    
    if (validReminders.length === 0) {
      return res.status(400).json({ error: "No valid reminder dates found for the selected booking date" });
    }
    
    // Handle individual reminder images
    for (let i = 0; i < validReminders.length; i++) {
      const imageKey = `reminderImage${i}`;
      if (req.files && req.files[imageKey] && req.files[imageKey][0]) {
        validReminders[i].imageUrl = await uploadToCloudinary(req.files[imageKey][0].buffer);
      }
    }
    
    const bookingReminder = await BookingReminder.findById(req.params.id);
    
    if (!bookingReminder) {
      return res.status(404).json({ error: "Booking reminder not found" });
    }

    bookingReminder.customer = customerId;
    bookingReminder.bookingDate = new Date(bookingDate);
    bookingReminder.customMessage = customMessage;
    bookingReminder.customImageUrl = customImageUrl;
    bookingReminder.reminders = validReminders;

    await bookingReminder.save();
    await bookingReminder.populate('customer', 'name phone');
    
    res.json(bookingReminder);
  } catch (error) {
    console.error('Error updating booking reminder:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE booking reminder
router.delete("/booking-reminders/:id", async (req, res) => {
  try {
    await BookingReminder.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: "Booking reminder cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger booking reminder check
router.post("/test-booking-reminders", async (req, res) => {
  try {
    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}] Manual trigger: Testing booking reminders`);
    
    if (getStatus() !== 'connected') {
      return res.status(400).json({ error: "WhatsApp not connected" });
    }
    
    await sendBookingReminders();
    res.json({ message: "Booking reminder check completed", timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check WhatsApp status
router.get("/whatsapp-status", async (req, res) => {
  try {
    const status = getStatus();
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    
    res.json({ 
      status: status,
      currentTime: currentTime,
      connected: status === 'connected'
    });
  } catch (error) {
    console.error('Error checking WhatsApp status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger scheduled messages
router.post("/test-scheduled-messages", async (req, res) => {
  try {
    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}] Manual trigger: Testing scheduled messages`);
    
    if (getStatus() !== 'connected') {
      return res.status(400).json({ error: "WhatsApp not connected" });
    }
    
    await sendScheduledMessages();
    res.json({ message: "Scheduled messages check completed", timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) });
  } catch (error) {
    console.error('Error in scheduled messages test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual QR code generation endpoint
router.post("/generate-qr", async (req, res) => {
  try {
    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}] Manual QR generation requested`);
    
    const { startClient } = await import("../whatsapp/whatsapp.js");
    await startClient();
    
    res.json({ message: "QR generation initiated", timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) });
  } catch (error) {
    console.error('Error in QR generation endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEBUG endpoint - Check booking reminders status
router.get("/debug-booking-reminders", async (req, res) => {
  try {
    const now = new Date();
    const currentTime = getCurrentISTTimeString();
    const currentDate = now.toISOString().split('T')[0];
    
    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}] DEBUG: Checking booking reminders status`);
    
    const reminders = await BookingReminder.find({ status: 'active' })
      .populate('customer', 'name phone')
      .sort({ bookingDate: 1 });

    const debugInfo = reminders.map(reminder => {
      const bookingDate = new Date(reminder.bookingDate);
      const nowIST = new Date(now.getTime());
      const bookingIST = new Date(bookingDate.getTime());
      const daysUntilBooking = Math.ceil((bookingIST - nowIST) / (1000 * 60 * 60 * 24));
      
      return {
        customerName: reminder.customer.name,
        customerPhone: reminder.customer.phone,
        bookingDate: bookingIST.toDateString(),
        daysUntilBooking,
        currentTime,
        reminders: reminder.reminders.map(r => ({
          daysBefore: r.daysBefore,
          sendTime: r.sendTime,
          status: r.status,
          shouldSendToday: r.daysBefore === daysUntilBooking && r.sendTime === currentTime,
          message: r.message || 'No message set',
          customMessage: reminder.customMessage || 'No custom message set'
        }))
      };
    });
    
    res.json({
      currentTime,
      currentDate,
      totalReminders: reminders.length,
      debugInfo
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// FIX endpoint - Repair existing reminder with missing customer data
router.post("/fix-customer-data/:reminderId", async (req, res) => {
  try {
    const { reminderId } = req.params;
    
    const reminder = await BookingReminder.findById(reminderId);
    
    if (!reminder) {
      return res.status(404).json({ error: "Booking reminder not found" });
    }
    
    console.log(`[FIX] Found reminder with customer ID: ${reminder.customer}`);
    
    // Repopulate customer data
    await reminder.populate('customer', 'name phone');
    
    console.log(`[FIX] Customer after populate: ${reminder.customer?.name} (${reminder.customer?.phone})`);
    
    // Save the populated data
    await reminder.save();
    
    res.json({
      success: true,
      reminderId: reminder._id,
      customerName: reminder.customer?.name,
      customerPhone: reminder.customer?.phone,
      message: "Customer data fixed successfully"
    });
  } catch (error) {
    console.error('Error fixing customer data:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEBUG endpoint - Check customer data for reminders
router.get("/debug-customer-data", async (req, res) => {
  try {
    const reminders = await BookingReminder.find({ status: 'active' }).populate('customer');
    
    const debugData = reminders.map(reminder => ({
      reminderId: reminder._id,
      customerId: reminder.customer,
      hasCustomerData: !!reminder.customer,
      customerName: reminder.customer?.name || 'NOT FOUND',
      customerPhone: reminder.customer?.phone || 'NOT FOUND',
      bookingDate: reminder.bookingDate,
      reminders: reminder.reminders
    }));
    
    res.json({
      totalReminders: reminders.length,
      debugData
    });
  } catch (error) {
    console.error('Error in debug customer data endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple test endpoint to send a test message
router.post("/test-send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: "Phone and message are required" });
    }
    
    const { sendWhatsAppMessage } = await import("../whatsapp/whatsapp.js");
    const result = await sendWhatsAppMessage(phone, message);
    
    res.json({ 
      success: result.success, 
      error: result.error,
      phone: phone,
      message: message
    });
  } catch (error) {
    console.error('Error in test send endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEBUG endpoint - Test message content for a specific reminder
router.post("/debug-message/:reminderId", async (req, res) => {
  try {
    const { reminderId } = req.params;
    
    const reminder = await BookingReminder.findById(reminderId).populate('customer', 'name phone');
    
    if (!reminder) {
      return res.status(404).json({ error: "Booking reminder not found" });
    }
    
    const now = new Date();
    const bookingDate = new Date(reminder.bookingDate);
    const daysUntilBooking = Math.ceil((bookingDate - now) / (1000 * 60 * 60 * 24));
    
    // Find the reminder for today
    const reminderToSend = reminder.reminders.find(r => 
      r.daysBefore === daysUntilBooking && 
      r.status === 'pending'
    );
    
    if (!reminderToSend) {
      return res.status(404).json({ error: "No pending reminder found for today" });
    }
    
    // Construct the message
    let message;
    if (reminder.customMessage && reminder.customMessage.trim() !== "") {
      message = reminder.customMessage;
    } else if (reminderToSend.message && reminderToSend.message.trim() !== "") {
      message = reminderToSend.message;
    } else {
      message = `Hi ${reminder.customer.name}, this is a reminder for your booking in ${reminderToSend.daysBefore} day(s).`;
    }
    
    // Replace placeholders
    message = message.replace('{name}', reminder.customer.name || 'Customer');
    message = message.replace('{days}', reminderToSend.daysBefore || 'unknown');
    message = message.replace('{date}', bookingDate.toLocaleDateString() || 'unknown date');
    
    res.json({
      customer: reminder.customer,
      bookingDate: reminder.bookingDate,
      daysUntilBooking,
      reminderToSend,
      customMessage: reminder.customMessage,
      constructedMessage: message,
      messageLength: message?.length || 0,
      isUndefined: message === 'undefined'
    });
  } catch (error) {
    console.error('Error in debug message endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// FIX endpoint - Update reminders without sendTime
router.post("/fix-reminder-times", async (req, res) => {
  try {
    const currentTime = getCurrentISTTimeString();
    
    const result = await BookingReminder.updateMany(
      { 
        status: 'active',
        'reminders.sendTime': { $exists: false }
      },
      { 
        '$set': { 
          'reminders.$.sendTime': currentTime
        }
      }
    );
    
    res.json({ 
      message: "Fixed reminders without sendTime", 
      updatedCount: result.modifiedCount,
      setTime: currentTime 
    });
  } catch (error) {
    console.error('Error fixing reminder times:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;