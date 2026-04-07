import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // WhatsApp Status State
  const [waStatus, setWaStatus] = useState('disconnected');
  const [waQr, setWaQr] = useState(null);

  // Use your dynamic backend URL!
  const API_URL = import.meta.env.VITE_NODE_URL;

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/booking/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWaStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/booking/whatsapp-status`);
        const data = await res.json();
        setWaStatus(data.status);
        setWaQr(data.qr);
      } catch (error) {
        console.error("Error fetching WA status:", error);
      }
    };

    fetchBookings(); 
    fetchWaStatus(); 
    
    // Poll for QR code every 3 seconds
    const interval = setInterval(fetchWaStatus, 3000);
    return () => clearInterval(interval);
  }, [API_URL]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking and all its reminders?')) {
      try {
        await fetch(`${API_URL}/api/booking/bookings/${id}`, { method: 'DELETE' });
        setBookings(bookings.filter(b => b._id !== id)); 
      } catch (error) {
        alert('Failed to delete booking');
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📸 Booking Manager</h1>
            <p className="text-gray-500">Manage bookings and automated WhatsApp reminders</p>
          </div>
          
          {/* WhatsApp Quick Status Badge */}
          <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full ${waStatus === 'connected' || waStatus === 'authenticated' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
             <span className="font-semibold text-gray-700 uppercase text-sm tracking-wider">
               {waStatus ? waStatus.replace('_', ' ') : 'Connecting...'}
             </span>
          </div>
        </div>

        {/* WhatsApp QR Code Section */}
        {waStatus === 'qr_needed' && waQr && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-indigo-500 flex flex-col md:flex-row items-center gap-8 justify-center">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp Disconnected</h2>
              <p className="text-gray-600 mb-4 max-w-md">Open WhatsApp on your phone, go to <strong>Linked Devices</strong>, and scan this QR code to activate the reminder bot.</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
              <QRCode value={waQr} size={200} />
            </div>
          </div>
        )}

        {/* Bookings List Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Upcoming Events</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded border border-dashed">No bookings found.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking._id} className="p-4 border rounded hover:bg-gray-50 flex justify-between items-center transition">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{booking.customer_name}</p>
                    <p className="text-sm text-gray-500">
                      {booking.event_type} • {new Date(booking.event_date).toLocaleDateString()} • 📞 {booking.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                      {booking.total_reminders || 0} Reminders
                    </span>
                    <button 
                      onClick={() => handleDelete(booking._id)} 
                      className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 p-2 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;