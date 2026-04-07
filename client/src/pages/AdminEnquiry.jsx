import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { 
  RefreshCw, Filter, X, Inbox, Mail, Phone, 
  Clock, Tag, User, Calendar, ExternalLink, ChevronRight, Search 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";

const AdminEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Flyout State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Filter & Search state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    source: "",
    search: "", // This handles your requested search function
  });

  const handleFilterChange = (e) =>
    setFilters((s) => ({ ...s, [e.target.name]: e.target.value }));

  const clearFilters = () =>
    setFilters({ status: "", source: "", search: "" });

  const filteredEnquiries = useMemo(() => {
    if (!enquiries || enquiries.length === 0) return [];
    return enquiries.filter((q) => {
      // Search functionality: Name, Email, Phone, or Event Type
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const haystack = `${q.name} ${q.email} ${q.phone} ${q.eventType}`.toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      if (filters.status && filters.status !== "all") {
        if ((q.status || "").toLowerCase() !== filters.status) return false;
      }
      if (filters.source && filters.source !== "all") {
        if ((q.source || "website").toLowerCase() !== filters.source) return false;
      }
      return true;
    });
  }, [enquiries, filters]);

  const fetchEnquiries = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/enquiry/enquiries`, { withCredentials: true });
      setEnquiries(res.data);
    } catch (err) {
      setError("Failed to load enquiries.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, []);

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Sidebar - Mobile Toggle Integrated */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area - Fixed ml-[260px] to be responsive */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Management</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-black">All Enquiries</h2>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-32"><Loader color="#C9A24D" /></div>
            ) : (
              <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden flex flex-col">
                
                {/* Responsive Header Controls */}
                <div className="p-4 md:p-8 border-b border-charcoal-black/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Integrated Search Box */}
                  <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" size={18} />
                    <input 
                      type="text" 
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search leads by name, email, or package..."
                      className="w-full pl-12 pr-4 py-3 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button onClick={fetchEnquiries} className="flex-1 lg:flex-none px-5 py-3 bg-white border border-charcoal-black/10 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-warm-ivory transition-all">
                      <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${showFilters ? 'bg-charcoal-black text-gold-accent' : 'bg-white border border-charcoal-black/10 text-charcoal-black'}`}>
                      <Filter size={14} /> Filters
                    </button>
                  </div>
                </div>

                {/* Status/Source Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-warm-ivory/10 border-b border-charcoal-black/5">
                      <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border border-charcoal-black/10 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gold-accent">
                          <option value="">All Statuses</option>
                          <option value="new">New</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                        </select>
                        <select name="source" value={filters.source} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border border-charcoal-black/10 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gold-accent">
                          <option value="">All Sources</option>
                          <option value="website">Website</option>
                          <option value="service-page">Service Page</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Table - Proper Horizontal Scroll Fix */}
                <div className="overflow-x-auto w-full custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-warm-ivory/50 text-slate-gray text-[10px] uppercase tracking-[0.2em] font-bold border-b border-charcoal-black/5">
                        <th className="px-6 py-5">Client Name</th>
                        <th className="px-6 py-5">Service/Package</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-black/5">
                      {filteredEnquiries.map((enquiry) => (
                        <tr 
                          key={enquiry._id} 
                          onClick={() => setSelectedEnquiry(enquiry)} 
                          className="hover:bg-warm-ivory/30 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-charcoal-black">{enquiry.name}</div>
                            <div className="text-xs text-slate-gray/60">{enquiry.email}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-charcoal-black">{enquiry.eventType}</div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-gray/60">
                              {enquiry.eventDate ? new Date(enquiry.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(enquiry.status)}`}>
                              {enquiry.status || "NEW"}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="inline-flex items-center gap-2 text-gold-accent font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              View <ChevronRight size={14} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Responsive Slide-over Flyout */}
      <AnimatePresence>
        {selectedEnquiry && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEnquiry(null)} className="fixed inset-0 bg-charcoal-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 flex items-center justify-between bg-warm-ivory/30">
                <h3 className="font-playfair text-2xl font-bold text-charcoal-black">Inquiry Detail</h3>
                <button onClick={() => setSelectedEnquiry(null)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                <section className="space-y-4">
                  <FlyoutItem icon={User} label="Client Name" value={selectedEnquiry.name} />
                  <FlyoutItem icon={Mail} label="Email" value={selectedEnquiry.email} isLink href={`mailto:${selectedEnquiry.email}`} />
                  <FlyoutItem icon={Phone} label="Phone" value={selectedEnquiry.phone} isLink href={`tel:${selectedEnquiry.phone}`} />
                </section>
                
                <div className="p-6 bg-warm-ivory/50 rounded-3xl border border-charcoal-black/5 space-y-4">
                  <FlyoutItem icon={Tag} label="Package/Service" value={selectedEnquiry.eventType} />
                  <FlyoutItem icon={Calendar} label="Target Date" value={selectedEnquiry.eventDate ? new Date(selectedEnquiry.eventDate).toLocaleDateString('en-US', { dateStyle: 'full' }) : 'Flexible'} />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-gray/60">Message</span>
                  <p className="text-charcoal-black leading-relaxed italic bg-white p-6 rounded-2xl border border-charcoal-black/5">"{selectedEnquiry.message}"</p>
                </div>
              </div>

              <div className="p-8 border-t border-charcoal-black/5">
                <button onClick={() => window.location.href = `/admin-enquiries/${selectedEnquiry._id}`} className="w-full py-4 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold-accent hover:text-charcoal-black transition-all">
                  Process lead <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Components
const FlyoutItem = ({ icon: Icon, label, value, isLink, href }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-full bg-white border border-charcoal-black/5 flex items-center justify-center text-gold-accent shrink-0 shadow-sm"><Icon size={18} /></div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-gray/60 mb-0.5">{label}</p>
      {isLink ? <a href={href} className="text-sm font-bold text-charcoal-black hover:text-gold-accent transition-colors truncate block">{value}</a> : <p className="text-sm font-bold text-charcoal-black truncate block">{value}</p>}
    </div>
  </div>
);

function getStatusStyle(status) {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "new": return "bg-gold-accent/10 text-gold-accent border-gold-accent/20";
    case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
    default: return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export default AdminEnquiry;