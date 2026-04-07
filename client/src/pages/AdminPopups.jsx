import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Save, Link as LinkIcon, Clock, Type, X, Megaphone } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminPopups = () => {
  const [currentPopup, setCurrentPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // FIX 1: Mobile state

  const [formData, setFormData] = useState({
    message: "",
    link: "",
    delay: 3000,
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchPopup();
  }, []);

  const fetchPopup = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/pop/popup`,
        { withCredentials: true }
      );
      if (response.data) {
        setCurrentPopup(response.data);
        setFormData({
          message: response.data.message || "",
          link: response.data.link || "",
          delay: response.data.delay || 3000,
          image: null,
        });
        setPreviewUrl(response.data.image);
      }
    } catch (error) {
      console.log("No active popup or error fetching");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData({ ...formData, image: null });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const data = new FormData();
    data.append("message", formData.message);
    data.append("link", formData.link);
    data.append("delay", formData.delay);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (currentPopup && currentPopup._id) {
        await axios.put(
          `${import.meta.env.VITE_NODE_URL}/api/pop/admin/popup/${currentPopup._id}`,
          data,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/pop/admin/popup`,
          data,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      toast.success("Marketing popup updated successfully!");
      fetchPopup();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update popup");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Connected Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Responsive Content Wrapper */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Megaphone className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Global Announcement</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage welcome popup</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-32"><Loader color="#C9A24D" /></div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden"
              >
                <form onSubmit={handleSubmit} className="p-6 md:p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    
                    {/* Left Column: Image Upload */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1 flex items-center justify-between">
                        <span>Featured Image</span>
                        <span className="text-slate-gray/50 normal-case tracking-normal">Optional</span>
                      </label>
                      
                      <div 
                        onClick={() => document.getElementById('popup-image-upload').click()}
                        className={`relative aspect-[4/5] md:aspect-square bg-warm-ivory/20 border-2 border-dashed rounded-2xl overflow-hidden group cursor-pointer transition-all ${
                          previewUrl ? 'border-gold-accent/30' : 'border-charcoal-black/10 hover:border-gold-accent'
                        }`}
                      >
                        {previewUrl ? (
                          <>
                            <img
                              src={previewUrl}
                              alt="Popup Preview"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                              <button
                                onClick={handleRemoveImage}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg"
                              >
                                <X size={14} /> Remove
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-gray p-6 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                              <Upload size={24} className="text-gold-accent" />
                            </div>
                            <span className="text-sm font-bold text-charcoal-black mb-1">Click to Upload Image</span>
                            <span className="text-[10px] uppercase tracking-widest">Recommended: 800x1000px</span>
                          </div>
                        )}
                        <input
                          id="popup-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Right Column: Form Details */}
                    <div className="space-y-8 flex flex-col">
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Type size={14} className="text-gold-accent" /> Announcement Text
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-5 py-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-accent focus:border-gold-accent transition-all text-charcoal-black placeholder:text-slate-gray/40 h-32 resize-none text-sm"
                          placeholder="e.g. Booking for Winter Weddings is now officially open! Secure your dates..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1 flex items-center gap-2">
                          <LinkIcon size={14} className="text-gold-accent" /> Destination URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-accent focus:border-gold-accent transition-all text-charcoal-black placeholder:text-slate-gray/40 text-sm"
                          placeholder="e.g. /contact or https://yourlink.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Clock size={14} className="text-gold-accent" /> Show Delay
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.delay}
                            onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
                            className="w-full px-5 py-3.5 pr-16 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-accent focus:border-gold-accent transition-all text-charcoal-black text-sm"
                            placeholder="3000"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-gray uppercase tracking-widest">
                            MS
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-gray/60 ml-1">3000ms = 3 seconds after page load</p>
                      </div>

                      <div className="pt-6 border-t border-charcoal-black/5 mt-auto">
                        <button
                          type="submit"
                          disabled={uploading}
                          className="w-full bg-charcoal-black text-gold-accent py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {uploading ? (
                            <><Loader color="#C9A24D" size={16} /> Saving Configuration...</>
                          ) : (
                            <><Save size={16} /> Publish Announcement</>
                          )}
                        </button>
                      </div>
                      
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPopups;