import React, { useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg w-full">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">Book Your Session</h1>
          <p className="opacity-80">We'll remind you via WhatsApp!</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="customer_name">Full Name</label>
            <input type="text" id="customer_name" name="customer_name" required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="phone">WhatsApp Number (with country code)</label>
            <input type="text" id="phone" name="phone" placeholder="e.g. 919876543210" required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="event_date">Event Date</label>
            <input type="date" id="event_date" name="event_date" required min={new Date().toISOString().split('T')[0]} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="event_type">Event Type</label>
            <select id="event_type" name="event_type" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="Wedding">Wedding</option>
              <option value="Pre-Wedding">Pre-Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Maternity">Maternity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition disabled:opacity-50 mt-4">
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;