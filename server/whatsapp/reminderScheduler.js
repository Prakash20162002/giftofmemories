import cron from "node-cron";
import { ScheduledMessage, BookingReminder } from '../Model/index.js';
import Lead from '../Model/Lead.js'; // Merged from cron.js
import { sendWhatsAppMessage, getStatus } from './whatsapp.js';

// Function to convert IST to UTC for scheduling
const convertISTToUTC = (istDate, istTime) => {
  const [hours, minutes] = istTime.split(':').map(Number);
  const utcDate = new Date(istDate);
  utcDate.setHours(hours - 5, minutes - 30, 0, 0); // IST is UTC+5:30
  return utcDate;
};

// Function to get current IST time
const getCurrentISTTime = () => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  return istTime;
};

// Function to get current IST time string for logging
const getCurrentISTString = () => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
};

// Function to get current IST time in HH:MM format
const getCurrentISTTimeString = () => {
  return new Date().toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Kolkata', 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).slice(0, 5);
};

// Function to send scheduled messages
const sendScheduledMessages = async () => {
  try {
    const now = getCurrentISTTime();
    const currentTime = getCurrentISTTimeString();
    const currentDate = now.toISOString().split('T')[0]; 
    
    const messagesToSend = await ScheduledMessage.find({ status: 'pending' }).populate('customer');

    const filteredMessages = messagesToSend.filter(message => {
      const messageDate = new Date(message.scheduledDate).toISOString().split('T')[0];
      return messageDate <= currentDate && message.scheduledTime <= currentTime;
    });

    for (const message of filteredMessages) {
      try {
        const result = await sendWhatsAppMessage(message.customer.phone, message.message, message.imageUrl);
        if (result.success) {
          await ScheduledMessage.findByIdAndUpdate(message._id, { status: 'sent', sentAt: new Date() });
        } else {
          await ScheduledMessage.findByIdAndUpdate(message._id, { status: 'failed', error: result.error });
        }
      } catch (error) {
        await ScheduledMessage.findByIdAndUpdate(message._id, { status: 'failed', error: error.message });
      }
    }
  } catch (error) {
    console.error(`[${getCurrentISTString()}] Error in scheduled message sender:`, error);
  }
};

// Function to send admin notification
const sendAdminNotification = async (customerName, customerPhone, daysBefore, messageSent, error = null) => {
  try {
    const adminPhone = process.env.ADMIN_PHONE || process.env.ADMIN_WHATSAPP_NUMBER;
    if (!adminPhone) return;
    
    let adminMessage = error 
      ? `❌ Booking Reminder Failed\n\n👤 Customer: ${customerName}\n📞 Phone: ${customerPhone}\n⏰ Reminder: ${daysBefore} days\n❌ Error: ${error}`
      : `✅ Booking Reminder Sent\n\n👤 Customer: ${customerName}\n📞 Phone: ${customerPhone}\n⏰ Reminder: ${daysBefore} days\n💬 Message: "${messageSent}"`;
    
    await sendWhatsAppMessage(adminPhone, adminMessage);
  } catch (notificationError) {
    console.error(`[${getCurrentISTString()}] ❌ Error sending admin notification:`, notificationError);
  }
};

// Function to send booking reminders
const sendBookingReminders = async () => {
  try {
    const now = getCurrentISTTime();
    const currentTime = getCurrentISTTimeString();
    
    const reminders = await BookingReminder.find({ status: 'active' }).populate('customer');

    for (const reminder of reminders) {
      if (!reminder.customer) continue;
      
      const bookingDate = new Date(reminder.bookingDate);
      const nowIST = new Date(now.getTime());
      const bookingIST = new Date(bookingDate.getTime());
      const daysUntilBooking = Math.ceil((bookingIST - nowIST) / (1000 * 60 * 60 * 24));
      
      const reminderToSend = reminder.reminders.find(r => 
        r.daysBefore === daysUntilBooking && r.status === 'pending' && r.sendTime === currentTime
      );

      if (reminderToSend) {
        try {
          const customerName = reminder.customer.name;
          const customerPhone = reminder.customer.phone;
          
          let message = reminderToSend.message || reminder.customMessage || `Hi ${customerName}, this is a reminder for your booking in ${reminderToSend.daysBefore} day(s).`;
          message = message.replace('{name}', customerName).replace('{days}', reminderToSend.daysBefore).replace('{date}', bookingIST.toLocaleDateString());
          
          let imageUrlToSend = reminderToSend.imageUrl || reminder.customImageUrl || null;
          
          const result = await sendWhatsAppMessage(customerPhone, message, imageUrlToSend);
          
          if (result.success) {
            await BookingReminder.updateOne({ _id: reminder._id, 'reminders.daysBefore': daysUntilBooking }, { '$set': { 'reminders.$.status': 'sent', 'reminders.$.sentAt': new Date() } });
            await sendAdminNotification(customerName, customerPhone, daysUntilBooking, message);
          } else {
            await BookingReminder.updateOne({ _id: reminder._id, 'reminders.daysBefore': daysUntilBooking }, { '$set': { 'reminders.$.status': 'failed', 'reminders.$.error': result.error } });
            await sendAdminNotification(customerName, customerPhone, daysUntilBooking, message, result.error);
          }
        } catch (error) {
          await BookingReminder.updateOne({ _id: reminder._id, 'reminders.daysBefore': daysUntilBooking }, { '$set': { 'reminders.$.status': 'failed', 'reminders.$.error': error.message } });
        }
      }
    }
  } catch (error) {
    console.error(`[${getCurrentISTString()}] Error in booking reminder sender:`, error);
  }
};

async function updateBookingReminderStatus() {
  try {
    const activeReminders = await BookingReminder.find({ status: 'active' }).populate('customer');
    for (const reminder of activeReminders) {
      const allReminders = reminder.reminders || [];
      const sentReminders = allReminders.filter(r => r.status === 'sent');
      const failedReminders = allReminders.filter(r => r.status === 'failed');
      
      if (sentReminders.length + failedReminders.length === allReminders.length && allReminders.length > 0) {
        const newStatus = failedReminders.length > 0 ? 'completed_with_failures' : 'completed';
        await BookingReminder.updateOne({ _id: reminder._id }, { $set: { status: newStatus } });
      }
    }
  } catch (error) {
    console.error(`[${getCurrentISTString()}] Error updating booking reminder status:`, error);
  }
}

// ----------------------------------------------------
// THE MASTER CRON SCHEDULER
// ----------------------------------------------------
cron.schedule('* * * * *', async () => {
  const istTime = getCurrentISTString();
  
  if (getStatus() === 'connected') {
    // 1. Process standard scheduled messages
    await sendScheduledMessages();
    
    // 2. Process booking countdown reminders
    await sendBookingReminders();
    await updateBookingReminderStatus();

    // 3. Process 1-Hour Lead Follow-ups (Merged from old cron.js)
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const sixtyOneMinsAgo = new Date(Date.now() - 61 * 60 * 1000);
      const pendingLeads = await Lead.find({
        status: 'pending',
        createdAt: { $lte: oneHourAgo, $gt: sixtyOneMinsAgo }
      });

      const FOLLOW_UP_TEMPLATE = `Hello {name}! 👋\n\nThank you for your interest in Gift of Memories. We noticed you reached out recently and wanted to follow up.\n\nWe'd love to connect with you and discuss how we can help. Feel free to reply to this message or call us anytime.\n\nLooking forward to hearing from you! 😊`;

      for (const lead of pendingLeads) {
        const message = FOLLOW_UP_TEMPLATE.replace("{name}", lead.name);
        const result = await sendWhatsAppMessage(lead.phone, message);
        if (result.success) {
          lead.status = 'sent';
          await lead.save();
          console.log(`[${istTime}] ✓ 1-Hour follow-up sent to ${lead.name}`);
        }
      }
    } catch (leadError) {
      console.error(`[${istTime}] ✗ Error processing lead follow-ups:`, leadError);
    }
  }
});

console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}] ✓ WhatsApp reminder scheduler & CRM initialized (IST Timezone)`);

export { getCurrentISTTime, getCurrentISTTimeString, sendBookingReminders, sendScheduledMessages, updateBookingReminderStatus };