import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  days_before: { type: Number, required: true },
  language: { type: String, required: true },
  content: { type: String, required: true }
});

export default mongoose.model('Template', templateSchema);