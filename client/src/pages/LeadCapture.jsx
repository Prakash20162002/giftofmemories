import React, { useState } from 'react';

const LeadCapture = () => {
  const [formData, setFormData] = useState({ name: '', countryCode: '+91', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const API_URL = import.meta.env.VITE_NODE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const fullNum = formData.countryCode + formData.phone;

    try {
      const res = await fetch(`${API_URL}/api/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, num: fullNum, email: formData.email })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: "Thank you! We will be in touch shortly." });
        setFormData({ name: '', countryCode: '+91', phone: '', email: '' }); // Reset
      } else {
        setStatus({ type: 'error', message: data.message || "Something went wrong." });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Cannot reach server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-black flex items-center justify-center p-4">
      <div className="bg-[#161619] border border-[#2a2a30] p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair text-warm-ivory mb-2">Get In Touch</h1>
          <p className="text-slate-gray">Leave your details and we'll reach out to you.</p>
        </div>

        {status.message && (
          <div className={`p-4 rounded-lg mb-6 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-gray mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-[#1c1c21] border border-[#2a2a30] text-warm-ivory rounded-lg px-4 py-3 focus:outline-none focus:border-gold-accent transition-colors" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm text-slate-gray mb-1">WhatsApp Number</label>
            <div className="flex gap-2">
              <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="bg-[#1c1c21] border border-[#2a2a30] text-warm-ivory rounded-lg px-3 py-3 focus:outline-none focus:border-gold-accent">
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US/CA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
              </select>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required pattern="\d{6,15}" title="Digits only, 6 to 15 characters" className="flex-1 bg-[#1c1c21] border border-[#2a2a30] text-warm-ivory rounded-lg px-4 py-3 focus:outline-none focus:border-gold-accent transition-colors" placeholder="9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-gray mb-1">Email (Optional)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#1c1c21] border border-[#2a2a30] text-warm-ivory rounded-lg px-4 py-3 focus:outline-none focus:border-gold-accent transition-colors" placeholder="john@example.com" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gold-accent text-charcoal-black font-bold text-lg py-3 rounded-lg hover:bg-[#c9a84c] transition-colors disabled:opacity-50 mt-4">
            {loading ? 'Submitting...' : 'Submit →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadCapture;