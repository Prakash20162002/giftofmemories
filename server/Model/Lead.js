import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed'], 
    default: 'pending' 
  }
}, { 
  timestamps: true // This automatically creates the 'createdAt' timestamp for your 1-hour scheduler!
});

export default mongoose.model('Lead', leadSchema);