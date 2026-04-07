import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  message: { type: String, required: true, trim: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) { return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v); },
      message: "Time must be in HH:MM format"
    }
  },
  imageUrl: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'sent', 'failed', 'cancelled'], default: 'pending' },
  sentAt: { type: Date },
  error: { type: String },
  createdAt: { type: Date, default: Date.now }
});

scheduledMessageSchema.index({ scheduledDate: 1, status: 1 });
scheduledMessageSchema.index({ customer: 1 });

export const ScheduledMessage = mongoose.model("ScheduledMessage", scheduledMessageSchema);