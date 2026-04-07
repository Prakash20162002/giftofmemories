import mongoose from "mongoose";

const reminderMessageSchema = new mongoose.Schema({
  daysBefore: { type: Number, required: true },
  message: { type: String, required: false, trim: true, default: "" },
  imageUrl: { type: String, trim: true },
  sendTime: { type: String, required: true, default: "10:00" },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  sentAt: { type: Date },
  error: { type: String }
});

const bookingReminderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  bookingDate: { type: Date, required: true },
  customMessage: { type: String, trim: true },
  customImageUrl: { type: String, trim: true },
  reminders: [reminderMessageSchema],
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

bookingReminderSchema.index({ bookingDate: 1, status: 1 });
bookingReminderSchema.index({ customer: 1 });

export const BookingReminder = mongoose.model("BookingReminder", bookingReminderSchema);