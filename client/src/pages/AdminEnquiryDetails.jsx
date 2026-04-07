import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { 
  ArrowLeft, Mail, Phone, Clock, Tag, User, 
  CheckCircle2, XCircle, Reply, Copy, ExternalLink, Send 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminEnquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailInfo, setEmailInfo] = useState(null);

  const openModal = (status) => {
    setModalStatus(status);
    setFeedback("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setModalStatus("");
    setFeedback("");
  };

  const submitStatus = async () => {
    if (!modalStatus) return;
    if (modalStatus === "responded" && !feedback.trim()) {
      toast.error("Please write a message to the client.");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/enquiry/enquiries/${id}/status`,
        { status: modalStatus, feedback },
        { withCredentials: true }
      );
      setEnquiry(res.data.enquiry);
      setEmailInfo(res.data.emailInfo || null);
      setShowModal(false);
      
      if (res.data.emailInfo?.sent) {
        toast.success("Client notified successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/enquiry/enquiries/${id}`,
          { withCredentials: true }
        );
        setEnquiry(res.data);
      } catch (err) {
        setError("Enquiry could not be found.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiry();
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen bg-warm-ivory/20">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 md:ml-[260px] flex flex-col items-center justify-center">
        <Loader color="#C9A24D" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-3 rounded-xl bg-white border border-charcoal-black/5 hover:bg-gold-accent hover:text-white transition-all shadow-sm"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="font-playfair text-3xl font-bold text-charcoal-black">
                    {enquiry?.name}
                  </h2>
                  <div className="flex items-center gap-2 text-slate-gray text-xs font-bold uppercase tracking-widest mt-1">
                    <StatusBadge status={enquiry?.status} />
                    <span>•</span>
                    <span>Received {new Date(enquiry?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => openModal("approved")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button
                  onClick={() => openModal("responded")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg"
                >
                  <Reply size={16} /> Respond
                </button>
                <button
                  onClick={() => openModal("rejected")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Primary Content Card */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <InfoBlock icon={Mail} label="Email Address" value={enquiry?.email} />
                    <InfoBlock icon={Phone} label="Phone Number" value={enquiry?.phone} />
                    <InfoBlock icon={Tag} label="Event Type" value={enquiry?.eventType} />
                    <InfoBlock icon={Clock} label="Planned Date" value={enquiry?.eventDate ? new Date(enquiry.eventDate).toLocaleDateString() : 'Not Set'} />
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em]">Message from Client</span>
                    <div className="bg-warm-ivory/50 p-6 rounded-2xl border border-charcoal-black/5 text-charcoal-black leading-relaxed whitespace-pre-wrap italic">
                      "{enquiry?.message}"
                    </div>
                  </div>

                  {enquiry?.adminFeedback && (
                    <div className="mt-8 pt-8 border-t border-charcoal-black/5 space-y-3">
                      <span className="text-[10px] font-bold text-gold-accent uppercase tracking-[0.2em]">Your Last Response</span>
                      <div className="bg-charcoal-black/5 p-6 rounded-2xl border border-charcoal-black/5 text-slate-gray leading-relaxed whitespace-pre-wrap">
                        {enquiry.adminFeedback}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Email Info Panel */}
                <AnimatePresence>
                  {emailInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white p-6 rounded-2xl border border-charcoal-black/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emailInfo.sent ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          <Send size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-charcoal-black uppercase tracking-widest">Email {emailInfo.sent ? 'Delivered' : 'Failed'}</p>
                          <p className="text-xs text-slate-gray">{emailInfo.to || enquiry.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {emailInfo.preview && (
                          <a href={emailInfo.preview} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-ivory text-charcoal-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold-accent transition-colors">
                            <ExternalLink size={12} /> Preview
                          </a>
                        )}
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Internal link copied"); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-black text-gold-accent rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-colors">
                          <Copy size={12} /> Copy URL
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Metadata */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
                  <h4 className="font-playfair text-xl font-bold text-charcoal-black mb-6 border-b border-charcoal-black/5 pb-4">Internal Details</h4>
                  <div className="space-y-6">
                    <SidebarMeta icon={User} label="Source" value={enquiry?.source || 'Website'} />
                    <SidebarMeta icon={Clock} label="Time Received" value={new Date(enquiry?.createdAt).toLocaleTimeString()} />
                    <SidebarMeta icon={Tag} label="Reference ID" value={enquiry?._id.slice(-8).toUpperCase()} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modern Backdrop Blur Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-md" 
              onClick={closeModal} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="mb-6">
                <h3 className="font-playfair text-2xl font-bold text-charcoal-black mb-2">
                  {modalStatus === "responded" ? "Send Client Message" : "Update Status"}
                </h3>
                <p className="text-sm text-slate-gray">
                  The client will be notified via email automatically.
                </p>
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                className="w-full p-5 bg-warm-ivory/50 border border-charcoal-black/5 rounded-2xl mb-6 focus:ring-1 focus:ring-gold-accent outline-none font-inter text-sm"
                placeholder="Write your response here..."
              />

              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3.5 border border-charcoal-black/10 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-charcoal-black/5 transition-all">
                  Cancel
                </button>
                <button
                  onClick={submitStatus}
                  disabled={saving}
                  className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-gold-accent hover:text-charcoal-black transition-all flex items-center justify-center gap-2"
                >
                  {saving ? "Sending..." : "Submit Update"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components for cleaner structure
const InfoBlock = ({ icon: Icon, label, value }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-full bg-warm-ivory flex items-center justify-center text-gold-accent shrink-0 border border-charcoal-black/5">
      <Icon size={18} />
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-charcoal-black truncate">{value || '-'}</p>
    </div>
  </div>
);

const SidebarMeta = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <Icon size={16} className="text-gold-accent" />
    <div className="flex justify-between w-full items-center">
      <span className="text-xs text-slate-gray font-medium">{label}</span>
      <span className="text-xs font-bold text-charcoal-black uppercase tracking-tighter">{value}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = (status || "pending").toLowerCase();
  const styles = {
    new: "text-gold-accent bg-gold-accent/10 border-gold-accent/20",
    responded: "text-emerald-600 bg-emerald-50 border-emerald-100",
    approved: "text-blue-600 bg-blue-50 border-blue-100",
    pending: "text-amber-600 bg-amber-50 border-amber-100",
    rejected: "text-red-600 bg-red-50 border-red-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${styles[s] || styles.pending}`}>
      {s}
    </span>
  );
};

export default AdminEnquiryDetails;