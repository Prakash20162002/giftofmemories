import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Star,
  Image as ImageIcon,
  FileText,
  Download,
  RefreshCw,
  BarChart3
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import Loader from "../components/Loader";

const AdminReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile layout state
  const [reports, setReports] = useState({
    bookings: { total: 0, pending: 0, accepted: 0, rejected: 0, thisMonth: 0, lastMonth: 0 },
    users: { total: 0, thisMonth: 0, lastMonth: 0 },
    services: { total: 0, mostBooked: [] },
    products: { total: 0, bestsellers: 0 },
    gallery: { total: 0 },
    blogs: { total: 0 },
    testimonials: { total: 0 },
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [
        enquiriesRes,
        usersRes,
        servicesRes,
        productsRes,
        galleryRes,
        blogsRes,
        testimonialsRes,
      ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_NODE_URL}/api/enquiry/enquiries`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_NODE_URL}/api/users/all`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_NODE_URL}/api/services/services`),
        axios.get(`${import.meta.env.VITE_NODE_URL}/api/shop/get-products`),
        axios.get(`${import.meta.env.VITE_NODE_URL}/api/gallery/get-gallery`),
        axios.get(`${import.meta.env.VITE_NODE_URL}/api/blogs`),
        axios.get(`${import.meta.env.VITE_NODE_URL}/api/testimonial/testimonials`),
      ]);

      const enquiries = enquiriesRes.data;
      const users = usersRes.data;
      const services = servicesRes.data;
      const products = productsRes.data;

      // Calculate dates
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Bookings statistics
      const bookingsThisMonth = enquiries.filter((e) => new Date(e.createdAt) >= firstDayThisMonth).length;
      const bookingsLastMonth = enquiries.filter(
        (e) => new Date(e.createdAt) >= firstDayLastMonth && new Date(e.createdAt) <= lastDayLastMonth
      ).length;

      // Users statistics
      const usersThisMonth = users.filter((u) => new Date(u.createdAt) >= firstDayThisMonth).length;
      const usersLastMonth = users.filter(
        (u) => new Date(u.createdAt) >= firstDayLastMonth && new Date(u.createdAt) <= lastDayLastMonth
      ).length;

      // Most booked services
      const serviceBookingCount = {};
      enquiries.forEach((e) => {
        if (e.eventType) {
          serviceBookingCount[e.eventType] = (serviceBookingCount[e.eventType] || 0) + 1;
        }
      });

      const mostBooked = Object.entries(serviceBookingCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setReports({
        bookings: {
          total: enquiries.length,
          pending: enquiries.filter((e) => e.status === "pending").length,
          accepted: enquiries.filter((e) => e.status === "approved" || e.status === "accepted").length,
          rejected: enquiries.filter((e) => e.status === "rejected").length,
          thisMonth: bookingsThisMonth,
          lastMonth: bookingsLastMonth,
        },
        users: { total: users.length, thisMonth: usersThisMonth, lastMonth: usersLastMonth },
        services: { total: services.length, mostBooked },
        products: { total: products.length, bestsellers: products.filter((p) => p.isBestseller).length },
        gallery: { total: galleryRes.data.length },
        blogs: { total: blogsRes.data.length },
        testimonials: { total: testimonialsRes.data.length },
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load business metrics");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const exportReport = () => {
    const reportData = JSON.stringify(reports, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Metrics exported securely");
  };

  // FIX: Pre-defined Tailwind classes instead of dynamic string interpolation to prevent purging
  const colorThemes = {
    gold: "bg-gold-accent/10 text-gold-accent",
    blue: "bg-blue-50 text-blue-500",
    purple: "bg-purple-50 text-purple-500",
    green: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
    indigo: "bg-indigo-50 text-indigo-500",
    pink: "bg-pink-50 text-pink-500",
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, growth, theme = "gold" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5 group hover:border-gold-accent/30 transition-all flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorThemes[theme]}`}>
          <Icon size={24} />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${growth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {growth >= 0 ? "+" : ""}{growth}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-playfair font-bold text-charcoal-black mb-1">{value}</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">{title}</p>
        {subtitle && <p className="text-xs text-slate-gray/60 mt-2">{subtitle}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Connected Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Responsive Content Wrapper */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-charcoal-black rounded-2xl flex items-center justify-center shrink-0">
                  <BarChart3 className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Studio Intelligence</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Analytics & Reporting Engine</p>
                </div>
              </div>
              
              <div className="flex w-full md:w-auto gap-3">
                <button
                  onClick={fetchReports}
                  disabled={isLoading}
                  className="flex-1 md:flex-none px-5 py-3 bg-warm-ivory/50 border border-charcoal-black/10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                </button>
                <button
                  onClick={exportReport}
                  className="flex-1 md:flex-none px-6 py-3 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg hover:bg-gold-accent hover:text-charcoal-black transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Export JSON
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : (
              <div className="space-y-8">
                
                {/* Primary Growth Metrics */}
                <div>
                  <h2 className="font-playfair text-xl font-bold text-charcoal-black mb-4 px-2">Growth & Acquisition</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                      icon={Calendar}
                      title="Total Bookings"
                      value={reports.bookings.total}
                      subtitle={`${reports.bookings.thisMonth} new this month`}
                      growth={calculateGrowth(reports.bookings.thisMonth, reports.bookings.lastMonth)}
                      theme="blue"
                    />
                    <StatCard
                      icon={Users}
                      title="Registered Clients"
                      value={reports.users.total}
                      subtitle={`${reports.users.thisMonth} joined this month`}
                      growth={calculateGrowth(reports.users.thisMonth, reports.users.lastMonth)}
                      theme="purple"
                    />
                    <StatCard
                      icon={ShoppingBag}
                      title="Shop Inventory"
                      value={reports.products.total}
                      subtitle={`${reports.products.bestsellers} marked as bestsellers`}
                      theme="amber"
                    />
                    <StatCard
                      icon={ImageIcon}
                      title="Gallery Assets"
                      value={reports.gallery.total}
                      subtitle="Live portfolio items"
                      theme="gold"
                    />
                  </div>
                </div>

                {/* Secondary Detail Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Bookings Funnel Status */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <Calendar size={20} className="text-gold-accent" />
                      <h3 className="font-playfair text-xl font-bold text-charcoal-black">Booking Funnel</h3>
                    </div>
                    
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between p-5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">Pending Review</span>
                        <span className="text-2xl font-bold text-amber-600">{reports.bookings.pending}</span>
                      </div>
                      <div className="flex items-center justify-between p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">Approved / Accepted</span>
                        <span className="text-2xl font-bold text-emerald-600">{reports.bookings.accepted}</span>
                      </div>
                      <div className="flex items-center justify-between p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-red-800">Declined / Rejected</span>
                        <span className="text-2xl font-bold text-red-600">{reports.bookings.rejected}</span>
                      </div>
                    </div>
                  </div>

                  {/* Most Booked Services */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <Star size={20} className="text-gold-accent" />
                      <h3 className="font-playfair text-xl font-bold text-charcoal-black">Top Performing Services</h3>
                    </div>
                    
                    {reports.services.mostBooked.length > 0 ? (
                      <div className="space-y-3">
                        {reports.services.mostBooked.map((service, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-warm-ivory/30 border border-charcoal-black/5 rounded-2xl group hover:border-gold-accent/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-charcoal-black/5 flex items-center justify-center text-charcoal-black font-bold text-sm">
                                {index + 1}
                              </div>
                              <span className="text-sm font-bold text-charcoal-black">
                                {service.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-gray">Leads:</span>
                              <span className="text-lg font-black text-gold-accent bg-gold-accent/10 px-3 py-1 rounded-lg">
                                {service.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-warm-ivory/20 rounded-2xl border-2 border-dashed border-charcoal-black/10">
                        <BarChart3 size={32} className="text-slate-gray/30 mb-3" />
                        <p className="text-sm font-bold text-charcoal-black">No lead data available</p>
                        <p className="text-xs text-slate-gray mt-1">Service rankings will appear here once clients book.</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Content Volume */}
                <div>
                  <h2 className="font-playfair text-xl font-bold text-charcoal-black mb-4 px-2">Content Volume</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <StatCard icon={Briefcase} title="Active Services" value={reports.services.total} theme="indigo" />
                    <StatCard icon={FileText} title="Journal Entries" value={reports.blogs.total} theme="pink" />
                    <StatCard icon={MessageSquare} title="Client Reviews" value={reports.testimonials.total} theme="green" />
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReportsPage;