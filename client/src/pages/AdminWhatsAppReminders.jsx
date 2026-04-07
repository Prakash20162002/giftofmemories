import { useState, useEffect, useCallback } from "react";
import { Users, Clock, Bell, RefreshCw, QrCode, Activity, Globe, MessageCircle, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import CustomerManager from "../components/whatsapp/CustomerManager";
import ScheduledMessageManager from "../components/whatsapp/ScheduledMessageManager";
import BookingReminderManager from "../components/whatsapp/BookingReminderManager";

const AdminWhatsAppReminders = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [connection, setConnection] = useState({ status: 'disconnected', qr: null });
  const [activeTab, setActiveTab] = useState('customers');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const [systemStats, setSystemStats] = useState({ customers: 0, scheduledMessages: 0, bookingReminders: 0 });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/status`, { withCredentials: true });
      setConnection(res.data);
      
      // Update current time
      setCurrentTime(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      
      // Auto-generate QR if disconnected
      if (res.data.status === 'disconnected') {
        try {
          await axios.post(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/generate-qr`, {}, { withCredentials: true });
          console.log('Auto-generating QR code...');
        } catch (error) {
          console.log('Failed to auto-generate QR:', error);
        }
      }
      
      // Fetch basic stats
      try {
        const [customersRes, scheduledRes, remindersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/customers`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/scheduled-messages`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/whatsapp-reminder/booking-reminders`, { withCredentials: true })
        ]);
        
        setSystemStats({
          customers: customersRes.data.length,
          scheduledMessages: scheduledRes.data.filter(m => m.status === 'pending').length,
          bookingReminders: remindersRes.data.filter(r => r.status === 'active').length
        });
      } catch {
        console.log('Stats fetch failed, but continuing...');
      }
    } catch { 
      console.log('Status check failed, but continuing...'); 
    }
  }, []);

  useEffect(() => {
    fetchStatus(); // Initial fetch
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const tabs = [
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'scheduled', label: 'Scheduled Messages', icon: Clock },
    { id: 'reminders', label: 'Booking Reminders', icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Page Header with Stats */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Activity className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">
                      WhatsApp Reminder System
                    </h1>
                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">
                      Automated Customer Communications
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-gray">
                      <Globe size={12} />
                      <span>IST: {currentTime}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
                  <div className="bg-warm-ivory/30 rounded-xl p-3 text-center">
                    <div className="text-charcoal-black font-bold text-lg">{systemStats.customers}</div>
                    <div className="text-slate-gray text-xs">Customers</div>
                  </div>
                  <div className="bg-warm-ivory/30 rounded-xl p-3 text-center">
                    <div className="text-charcoal-black font-bold text-lg">{systemStats.scheduledMessages}</div>
                    <div className="text-slate-gray text-xs">Pending</div>
                  </div>
                  <div className="bg-warm-ivory/30 rounded-xl p-3 text-center">
                    <div className="text-charcoal-black font-bold text-lg">{systemStats.bookingReminders}</div>
                    <div className="text-slate-gray text-xs">Active</div>
                  </div>
                </div>

                {/* Connection Status */}
                <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shrink-0 ${
                  connection.status === 'connected' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${connection.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  {connection.status === 'connected' ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-charcoal-black/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-xl font-bold text-charcoal-black flex items-center gap-3">
                  <MessageCircle className="text-gold-accent" /> WhatsApp Connection Status
                </h3>
                <button
                  onClick={fetchStatus}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-accent/10 text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all"
                >
                  <RefreshCw size={16} className={connection.status === 'qr_needed' ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {connection.status === 'connected' ? (
                <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-emerald-900 font-bold text-lg mb-2">WhatsApp Connected</h4>
                  <p className="text-emerald-700/70 text-sm mb-4">Your WhatsApp is successfully linked and ready for automated messaging.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                    <div className="bg-white rounded-xl p-4 text-center">
                      <div className="text-emerald-600 font-bold text-lg">✓ Active</div>
                      <div className="text-slate-gray text-xs">System Status</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <div className="text-emerald-600 font-bold text-lg">✓ Ready</div>
                      <div className="text-slate-gray text-xs">Message Sending</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <div className="text-emerald-600 font-bold text-lg">✓ IST</div>
                      <div className="text-slate-gray text-xs">Timezone</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
                    <AlertCircle className="text-amber-600" size={24} />
                    <div>
                      <h4 className="text-amber-900 font-bold text-sm mb-1">WhatsApp Not Connected</h4>
                      <p className="text-amber-800/70 text-sm">
                        Scan the QR code below to connect WhatsApp and enable automated messaging.
                      </p>
                    </div>
                  </div>

                  {connection.qr ? (
                    <div className="flex flex-col items-center p-8 bg-warm-ivory/30 rounded-3xl border-2 border-dashed border-gold-accent/20">
                      <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
                        <QRCodeSVG value={connection.qr} size={200} />
                      </div>
                      <div className="text-center">
                        <QrCode className="mx-auto text-gold-accent mb-3" size={32} />
                        <h4 className="font-bold text-charcoal-black mb-2">Scan QR Code</h4>
                        <p className="text-slate-gray text-sm max-w-md">
                          Open WhatsApp &gt; Linked Devices &gt; Link a device &gt; Scan QR code
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-gray">
                          <RefreshCw className="animate-spin" size={12} />
                          <span>QR code refreshes automatically</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <RefreshCw className="mx-auto text-gold-accent animate-spin mb-4" size={32} />
                      <p className="text-slate-gray text-sm">Generating QR code...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 p-2">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                      console.log('Tab clicked:', tab.id);
                      setActiveTab(tab.id);
                    }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === tab.id
                          ? 'bg-charcoal-black text-gold-accent shadow-lg'
                          : 'text-slate-gray hover:bg-warm-ivory/30'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div
              key={activeTab}
              className="transition-all duration-300"
            >
              {activeTab === 'customers' && (
                <div key="customers">
                  <CustomerManager />
                </div>
              )}
              {activeTab === 'scheduled' && (
                <div key="scheduled">
                  <ScheduledMessageManager />
                </div>
              )}
              {activeTab === 'reminders' && (
                <div key="reminders">
                  <BookingReminderManager />
                </div>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminWhatsAppReminders;