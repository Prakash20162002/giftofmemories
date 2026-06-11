import React, { useState } from 'react';
import PageVideoSection from '../components/PageVideoSection';

const BookingForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Using FormData because we might be sending image files
    const formData = new FormData(e.target);

    // Add some default automated reminders if the user didn't explicitly select them
    // This matches the format our new BookingController expects
    const defaultReminders = [
      { days_before: 30, active: true },
      { days_before: 15, active: true },
      { days_before: 7, active: true },
      { days_before: 1, active: true }
    ];
    formData.append('reminders', JSON.stringify(defaultReminders));

    try {
      // FIX: Using the dynamic environment variable instead of localhost
      const API_URL = import.meta.env.VITE_NODE_URL;
      
      const response = await fetch(`${API_URL}/api/booking/bookings`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create booking');

      setMessage({ text: '✓ Booking confirmed! Automated WhatsApp reminders are scheduled.', type: 'success' });
      e.target.reset(); // Clear the form
    } catch (error) {
      setMessage({ text: '✗ ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-28 lg:pt-36 pb-16 flex flex-col items-center px-4 md:px-6">
      
      {/* Booking Form Card */}
      <div className="bg-white rounded-3xl border border-charcoal-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden max-w-lg w-full mb-16">
        
        {/* Form Header */}
        <div className="bg-charcoal-black p-8 text-center text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_#C9A24D_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          <h1 className="text-3xl font-playfair font-bold text-warm-ivory">Book Your Session</h1>
          <p className="text-[10px] font-bold text-gold-accent uppercase tracking-widest mt-2">Automated WhatsApp Reminders Included</p>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-gray ml-1" htmlFor="customer_name">
              Full Name
            </label>
            <input 
              type="text" 
              id="customer_name" 
              name="customer_name" 
              required 
              placeholder="e.g. Rig Biswas"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium text-charcoal-black placeholder:text-gray-300 focus:bg-white focus:outline-none focus:border-gold-accent focus:ring-4 focus:ring-gold-accent/5 transition-all" 
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-gray ml-1" htmlFor="phone">
              WhatsApp Number (with country code)
            </label>
            <input 
              type="text" 
              id="phone" 
              name="phone" 
              placeholder="e.g. 918335934679" 
              required 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium text-charcoal-black placeholder:text-gray-300 focus:bg-white focus:outline-none focus:border-gold-accent focus:ring-4 focus:ring-gold-accent/5 transition-all" 
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-gray ml-1" htmlFor="event_date">
              Event Date
            </label>
            <input 
              type="date" 
              id="event_date" 
              name="event_date" 
              required 
              min={new Date().toISOString().split('T')[0]} 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium text-charcoal-black focus:bg-white focus:outline-none focus:border-gold-accent focus:ring-4 focus:ring-gold-accent/5 transition-all cursor-pointer" 
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-gray ml-1" htmlFor="event_type">
              Event Type
            </label>
            <select 
              id="event_type" 
              name="event_type" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium text-charcoal-black focus:bg-white focus:outline-none focus:border-gold-accent focus:ring-4 focus:ring-gold-accent/5 transition-all cursor-pointer"
            >
              <option value="Wedding">Wedding</option>
              <option value="Pre-Wedding">Pre-Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Maternity">Maternity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-charcoal-black text-gold-accent hover:bg-gold-accent hover:text-charcoal-black font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 cursor-pointer mt-6"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>

      {/* Dynamic Video Guides Section */}
      <div className="w-full max-w-[1240px] mx-auto border-t border-charcoal-black/5 pt-10">
        <PageVideoSection pageType="booking" title="Booking Guides" subtitle="How to Book Your Session" layout="static" />
      </div>
    </div>
  );
};

export default BookingForm;