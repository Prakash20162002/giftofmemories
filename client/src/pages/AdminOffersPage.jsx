import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, X, Eye, EyeOff, Tag,
  Info, Save, Megaphone, Link as LinkIcon, Image as ImageIcon
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: null,
  });

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/offers/admin/all`,
        { withCredentials: true }
      );
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const resetForm = () => {
    setFormData({ title: "", description: "", link: "", image: null });
    setEditingOffer(null);
  };

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title || "",
        description: offer.description || "",
        link: offer.link || "",
        image: null, 
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Offer title is required");
    if (!editingOffer && !formData.image) return toast.error("Image is required for new offers");

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("link", formData.link);
      if (formData.image) data.append("image", formData.image);

      if (editingOffer) {
        toast.info("Update logic is currently handled by creating a new active offer");
      } else {
        await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/offers/admin/create`,
          data,
          { withCredentials: true }
        );
        toast.success("Offer published successfully");
      }

      fetchOffers();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promotional offer?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/offers/admin/delete/${id}`,
        { withCredentials: true }
      );
      setOffers((prev) => prev.filter((o) => o._id !== id));
      toast.success("Offer removed");
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_NODE_URL}/api/offers/admin/toggle/${id}`,
        {},
        { withCredentials: true }
      );
      fetchOffers();
      toast.success("Visibility updated");
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 w-full md:ml-[280px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Megaphone className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Promotions</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Multi-Offer Stack System</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="w-full md:w-auto px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={16} /> New Promotion
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <Info className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-emerald-800 font-bold text-sm mb-1">Stacked Offers Active</h4>
                <p className="text-emerald-700/80 text-xs leading-relaxed">
                  You can now have <strong>multiple</strong> offers active at the same time. They will automatically display as a scrollable stack to your visitors!
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : offers.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-charcoal-black/5">
                <div className="w-20 h-20 bg-warm-ivory/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Tag size={32} className="text-slate-gray/30" />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-charcoal-black mb-2">No Promotions Found</h3>
                <p className="text-slate-gray text-sm mb-8 max-w-md mx-auto">Capture your visitor's attention by creating promotional offers.</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-6 py-3 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg"
                >
                  Create First Offer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {offers.map((offer) => (
                  <motion.div
                    key={offer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-[2rem] shadow-sm border transition-all overflow-hidden ${
                      offer.isActive ? "border-gold-accent/30 ring-1 ring-gold-accent/10" : "border-charcoal-black/5 opacity-70"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden bg-warm-ivory shrink-0">
                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                        {offer.isActive && (
                          <div className="absolute top-4 left-4 bg-gold-accent text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">
                            Live Now
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <h3 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-black mb-2">{offer.title}</h3>
                            <p className="text-slate-gray text-xs md:text-sm line-clamp-2 max-w-xl">{offer.description || "No description provided."}</p>
                            {offer.link && (
                              <div className="flex items-center gap-2 text-gold-accent text-[10px] font-bold uppercase tracking-widest mt-4">
                                <LinkIcon size={12} /> Target: {offer.link}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start">
                            <button
                              onClick={() => handleToggleActive(offer._id)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                offer.isActive 
                                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                            >
                              {offer.isActive ? <><EyeOff size={14}/> Disable</> : <><Eye size={14}/> Set Active</>}
                            </button>
                            <button 
                              onClick={() => handleDelete(offer._id)}
                              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-charcoal-black/5 flex items-center justify-between">
                           <span className="text-[9px] font-bold text-slate-gray/50 uppercase tracking-[0.2em]">
                             Created: {new Date(offer.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">Launch Promotion</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Floating offer configuration</p>
                </div>
                <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Promotion Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="e.g. 20% Wedding Early Bird" 
                    className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Caption / Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Briefly explain the benefit..." 
                    rows={3} 
                    className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1 flex items-center gap-2">
                    <LinkIcon size={12}/> Target Link (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={formData.link} 
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })} 
                    placeholder="/shop or https://..." 
                    className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1 flex items-center gap-2">
                    <ImageIcon size={12}/> Cover Image <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                      className="w-full px-5 py-8 bg-warm-ivory/30 border-2 border-dashed border-charcoal-black/10 rounded-xl text-xs text-slate-gray file:hidden cursor-pointer hover:border-gold-accent transition-colors"
                      required={!editingOffer}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-gray/40 font-bold uppercase text-[9px] tracking-widest">
                      {formData.image ? formData.image.name : "Click or drag offer banner"}
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />}
                  {isSubmitting ? "Uploading..." : "Publish & Activate"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOffersPage;