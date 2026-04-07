import { ArrowRight, Inbox, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const RecentEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/enquiry/enquiries`,
          { withCredentials: true }
        );
        setEnquiries(res.data.slice(0, 10)); 
      } catch (err) {
        setEnquiries([]);
        console.error("Failed to fetch enquiries", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "new": return "bg-gold-accent/10 text-gold-accent border-gold-accent/20";
      case "responded": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-charcoal-black/5 text-slate-gray border-charcoal-black/10";
    }
  };

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden font-inter flex flex-col">
      {/* Header */}
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-charcoal-black/5">
        <div>
          <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">
            Lead Management
          </span>
          <h3 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-black">
            Recent Enquiries
          </h3>
        </div>
        <button 
          onClick={() => navigate("/admin-enquiries")} // Redirect to full list
          className="text-gold-accent text-xs md:text-sm font-bold uppercase tracking-widest hover:text-charcoal-black transition-colors flex items-center gap-2 group"
        >
          View All{" "}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto relative custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-warm-ivory/50 text-slate-gray text-[10px] uppercase tracking-[0.2em] font-bold border-b border-charcoal-black/5">
              <th className="px-6 md:px-8 py-4">Client Name</th>
              <th className="px-6 md:px-8 py-4">Contact</th>
              <th className="px-6 md:px-8 py-4">Source</th>
              <th className="px-6 md:px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Loader2 className="w-6 h-6 text-gold-accent animate-spin mx-auto" />
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                   <p className="text-sm font-medium text-charcoal-black">No recent enquiries</p>
                </td>
              </tr>
            ) : (
              enquiries.map((enquiry) => (
                <tr
                  key={enquiry._id}
                  // REDIRECT FIX: Navigate to the details page on click
                  onClick={() => navigate(`/admin-enquiries/${enquiry._id}`)}
                  className="border-b border-charcoal-black/5 hover:bg-warm-ivory/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 md:px-8 py-4 text-charcoal-black text-sm font-bold">
                    {enquiry.name}
                  </td>
                  <td className="px-6 md:px-8 py-4 text-slate-gray text-sm">
                    {enquiry.email || enquiry.phone}
                  </td>
                  <td className="px-6 md:px-8 py-4 text-slate-gray text-sm">
                    {enquiry.source ? capitalize(enquiry.source) : "Website"}
                  </td>
                  <td className="px-6 md:px-8 py-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(enquiry.status)}`}
                    >
                      {enquiry.status || "New"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentEnquiries;