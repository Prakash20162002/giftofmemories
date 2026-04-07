import { motion } from "framer-motion";
import { Layers, Image as ImageIcon, MessageSquare, Bell, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import MetricCard from "../components/admin/MetricCard";
import RecentEnquiries from "../components/admin/RecentEnquiries";

const DashboardPage = () => {
  const [counts, setCounts] = useState({
    services: 0,
    gallery: 0,
    enquiries: 0,
    reminders: 0,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile layout state

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/admin/metrics`,
          { withCredentials: true }
        );
        setCounts(res.data);
      } catch (err) {
        console.error("Failed to load metrics", err);
      }
    };
    fetchMetrics();
  }, []);

  const metrics = [
    {
      label: "Total Services",
      value: counts.services ?? 0,
      icon: Layers,
      delay: 0.1,
    },
    {
      label: "Gallery Items",
      value: counts.gallery ?? 0,
      icon: ImageIcon,
      delay: 0.2,
    },
    {
      label: "Total Enquiries",
      value: counts.enquiries ?? 0,
      icon: MessageSquare,
      delay: 0.3,
    },
    {
      label: "Reminders Set",
      value: counts.reminders ?? 0,
      icon: Bell,
      delay: 0.4,
    },
  ];

  // Mock data for the activity chart
  const weeklyData = [
    { day: "Mon", visits: 35 },
    { day: "Tue", visits: 55 },
    { day: "Wed", visits: 40 },
    { day: "Thu", visits: 75 },
    { day: "Fri", visits: 50 },
    { day: "Sat", visits: 90 },
    { day: "Sun", visits: 65 },
  ];

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter overflow-x-hidden">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area - Flexible width to prevent mobile overflow */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Activity className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Studio Command Center</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Here's what's happening today</p>
                </div>
              </div>
            </motion.div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Recent Enquiries (Spans 2 columns on desktop) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                {/* Assuming RecentEnquiries is a self-contained component, it will naturally fill this space */}
                <RecentEnquiries />
              </motion.div>

              {/* Activity Chart (Spans 1 column on desktop) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5 flex flex-col"
              >
                <div className="mb-8">
                  <h3 className="font-playfair text-xl font-bold text-charcoal-black">Activity Overview</h3>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mt-1">Site visits past 7 days</p>
                </div>
                
                {/* Custom Bar Chart */}
                <div className="flex-1 flex items-end justify-between h-[180px] gap-2 md:gap-3 mt-auto relative">
                  {/* Faint background grid lines for aesthetic */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-t border-dashed border-slate-gray w-full h-0"></div>
                    <div className="border-t border-dashed border-slate-gray w-full h-0"></div>
                    <div className="border-t border-dashed border-slate-gray w-full h-0"></div>
                  </div>

                  {weeklyData.map((data, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-3 flex-1 group z-10 h-full justify-end"
                    >
                      <div className="w-full flex-1 flex items-end justify-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${data.visits}%` }}
                          transition={{
                            delay: 0.5 + i * 0.1,
                            duration: 0.8,
                            ease: "easeOut",
                          }}
                          className="w-full max-w-[40px] bg-warm-ivory rounded-t-lg group-hover:bg-gold-accent transition-colors duration-300 relative"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal-black text-white text-[10px] font-bold py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                            {data.visits} Visits
                            {/* Tooltip arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal-black rotate-45"></div>
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-[9px] text-slate-gray font-bold uppercase tracking-widest mt-2">
                        {data.day}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;