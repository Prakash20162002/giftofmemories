import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10,15}$/.test(v);
      },
      message: "Phone number must contain only digits (no + sign) and be 10-15 digits long"
    }
  },
  email: { type: String, trim: true, lowercase: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

export const Customer = mongoose.model("Customer", customerSchema);