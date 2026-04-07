import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Eye,
  EyeOff,
  ShoppingBag,
  Briefcase,
  Image as ImageIcon,
  MessageSquare,
  Save,
  RefreshCw,
  Video,
  Youtube,
  Upload,
  X,
  Trash2,
  Play,
  Plus,
  LayoutTemplate,
  Grid3X3 // FIX: Added missing import that caused the white screen crash
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminHomepageSettings = () => {
  const [settings, setSettings] = useState({
    showProducts: true,
    showServices: true,
    showGallery: true,
    showTestimonials: true,
    showScrollGallery: true,
    showStackedGallery: true,
    showHomeVideo: true,
    homeVideos: [],
    productsSectionTitle: "Premium Products",
    productsSectionDescription: "",
    productsSectionBadge: "Featured Collection",
    servicesSectionTitle: "Our Services",
    servicesSectionDescription: "",
    servicesSectionBadge: "What We Do",
    faqs: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile layout state

  // Video Modal States
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoModalType, setVideoModalType] = useState("youtube");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);

  // Video Form States
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-settings/get-settings`,
        { withCredentials: true }
      );
      if (response.data) setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load homepage settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = async (section) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-settings/toggle/${section}`,
        {},
        { withCredentials: true }
      );
      setSettings(response.data.settings);
      toast.success(`${section.replace("show", "")} visibility updated`);
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const response = await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-settings/update-settings`,
        settings,
        { withCredentials: true }
      );
      setSettings(response.data.settings);
      toast.success("Content saved successfully");
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- VIDEO HANDLERS ----------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) return toast.error("Select a valid video file");
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return toast.error("Please enter a YouTube URL");

    try {
      setIsUploadingVideo(true);
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-settings/video/youtube`,
        { youtubeUrl, title: videoTitle, description: videoDescription },
        { withCredentials: true }
      );
      setSettings(response.data.settings);
      toast.success("YouTube video linked!");
      resetVideoModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to link video");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error("Please select a video");

    try {
      setIsUploadingVideo(true);
      const formData = new FormData();
      formData.append("video", uploadFile);
      formData.append("title", videoTitle);
      formData.append("description", videoDescription);

      const response = await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-settings/video/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setSettings(response.data.settings);
      toast.success("Video uploaded!");
      resetVideoModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Remove this video from the homepage?")) return;

    try {
      setDeletingVideoId(videoId);
      const response = await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-settings/video/${videoId}`,
        { withCredentials: true }
      );
      setSettings(response.data.settings);
      toast.success("Video removed");
    } catch (error) {
      toast.error("Failed to delete video");
    } finally {
      setDeletingVideoId(null);
    }
  };

  const resetVideoModal = () => {
    setShowVideoModal(false);
    setYoutubeUrl("");
    setVideoTitle("");
    setVideoDescription("");
    setUploadFile(null);
    setUploadPreview(null);
  };

  const sections = [
    { key: "showProducts", label: "Products Showcase", description: "Featured albums & merch", icon: ShoppingBag, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { key: "showServices", label: "Services List", description: "Core photography packages", icon: Briefcase, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { key: "showHomeVideo", label: "Cinematic Video", description: "Main promotional video player", icon: Video, color: "text-red-600 bg-red-50 border-red-100" },
    { key: "showGallery", label: "Parallax Intro", description: "Horizontal scrolling gallery", icon: ImageIcon, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { key: "showTestimonials", label: "Client Reviews", description: "Testimonial slider block", icon: MessageSquare, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { key: "showScrollGallery", label: "Narrative Scroll", description: "Side images in story section", icon: LayoutTemplate, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { key: "showStackedGallery", label: "Stacked Deck", description: "Vertical scroll-animated cards", icon: Grid3X3, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  ];

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Connected Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Responsive Content Wrapper */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader color="#C9A24D" /></div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Settings className="text-gold-accent" size={24} />
                  </div>
                  <div>
                    <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Global Architecture</h1>
                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Control layout & text copy</p>
                  </div>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                  <button onClick={fetchSettings} className="flex-1 md:flex-none px-5 py-3.5 bg-warm-ivory/50 border border-charcoal-black/10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> Refresh
                  </button>
                  <button onClick={handleSaveAll} disabled={isSaving} className="flex-1 md:flex-none px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg hover:bg-gold-accent hover:text-charcoal-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSaving ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} {isSaving ? "Saving..." : "Save Copy"}
                  </button>
                </div>
              </div>

              {/* Section Toggles - Premium Grid */}
              <div>
                <h3 className="font-playfair text-xl font-bold text-charcoal-black mb-4 px-2">Visibility Switches</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    const isVisible = settings[section.key];

                    return (
                      <motion.div
                        key={section.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl p-5 border border-charcoal-black/5 shadow-sm flex flex-col justify-between transition-all hover:border-gold-accent/30"
                      >
                        <div className="flex items-start gap-4 mb-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${section.color}`}>
                            <Icon size={18} strokeWidth={2} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-charcoal-black leading-tight">{section.label}</h4>
                            <p className="text-[10px] text-slate-gray mt-1 leading-snug">{section.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggle(section.key)}
                          className={`w-full py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            isVisible 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                              : "bg-charcoal-black/5 text-slate-gray border border-charcoal-black/10 hover:bg-charcoal-black/10"
                          }`}
                        >
                          {isVisible ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Hidden</>}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Text Copy Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Products Copy */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-charcoal-black/5 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingBag className="text-gold-accent" size={20} />
                    <h3 className="font-playfair text-xl font-bold text-charcoal-black">Products Section Copy</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Eyebrow / Badge Text</label>
                      <input
                        value={settings.productsSectionBadge || ""}
                        onChange={(e) => setSettings({ ...settings, productsSectionBadge: e.target.value })}
                        placeholder="Featured Collection"
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Main Headline</label>
                      <input
                        value={settings.productsSectionTitle || ""}
                        onChange={(e) => setSettings({ ...settings, productsSectionTitle: e.target.value })}
                        placeholder="Premium Products"
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                      />
                      <p className="text-[9px] text-slate-gray/60 ml-1">The last word automatically renders in gold script.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Paragraph Description</label>
                      <textarea
                        value={settings.productsSectionDescription || ""}
                        onChange={(e) => setSettings({ ...settings, productsSectionDescription: e.target.value })}
                        rows={4}
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Services Copy */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-charcoal-black/5 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="text-gold-accent" size={20} />
                    <h3 className="font-playfair text-xl font-bold text-charcoal-black">Services Section Copy</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Eyebrow / Badge Text</label>
                      <input
                        value={settings.servicesSectionBadge || ""}
                        onChange={(e) => setSettings({ ...settings, servicesSectionBadge: e.target.value })}
                        placeholder="What We Do"
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Main Headline</label>
                      <input
                        value={settings.servicesSectionTitle || ""}
                        onChange={(e) => setSettings({ ...settings, servicesSectionTitle: e.target.value })}
                        placeholder="Our Services"
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                      />
                      <p className="text-[9px] text-slate-gray/60 ml-1">The last word automatically renders in gold script.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Paragraph Description</label>
                      <textarea
                        value={settings.servicesSectionDescription || ""}
                        onChange={(e) => setSettings({ ...settings, servicesSectionDescription: e.target.value })}
                        rows={4}
                        className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Video Management Engine */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                      <Video className="text-red-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-playfair text-xl font-bold text-charcoal-black">Cinematic Reel</h3>
                      <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">{settings.homeVideos?.length || 0} Videos active</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => { setVideoModalType("youtube"); setShowVideoModal(true); }} className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <Youtube size={14} /> Add YouTube
                    </button>
                    <button onClick={() => { setVideoModalType("upload"); setShowVideoModal(true); }} className="flex-1 sm:flex-none px-4 py-2.5 bg-charcoal-black text-gold-accent rounded-xl hover:bg-gold-accent hover:text-charcoal-black transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <Upload size={14} /> Upload MP4
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {(settings.homeVideos || []).map((video) => (
                      <motion.div key={video._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="border border-charcoal-black/10 rounded-2xl overflow-hidden group bg-warm-ivory/20 flex flex-col">
                        <div className="relative aspect-video bg-charcoal-black">
                          {video.type === "youtube" ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <video src={video.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          )}
                          
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30">
                              <Play size={16} className="ml-1" fill="currentColor" />
                            </div>
                          </div>

                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md ${video.type === "youtube" ? "bg-red-600/90" : "bg-gold-accent/90"}`}>
                              {video.type === "youtube" ? "YouTube" : "Video"}
                            </span>
                          </div>

                          {/* Delete Overlay */}
                          <div className="absolute inset-0 bg-charcoal-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                             <button
                                type="button"
                                onClick={() => handleDeleteVideo(video._id)}
                                disabled={deletingVideoId === video._id}
                                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                              >
                                {deletingVideoId === video._id ? <Loader color="#fff" size={16} /> : <Trash2 size={16} />}
                              </button>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="font-bold text-sm text-charcoal-black truncate">{video.title || "Untitled Cinematic"}</h4>
                          <p className="text-[10px] text-slate-gray mt-1 line-clamp-2">{video.description || "No description provided."}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty State / Add Button */}
                  <button onClick={() => { setVideoModalType("youtube"); setShowVideoModal(true); }} className="border-2 border-dashed border-charcoal-black/10 rounded-2xl aspect-video flex flex-col items-center justify-center hover:border-gold-accent hover:bg-gold-accent/5 transition-colors group min-h-[160px]">
                    <div className="w-10 h-10 rounded-full bg-charcoal-black/5 flex items-center justify-center text-slate-gray group-hover:bg-gold-accent group-hover:text-white transition-colors mb-2">
                      <Plus size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray group-hover:text-charcoal-black">Attach Video</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Video Add Modal (z-[100]) */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetVideoModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
              
              <div className={`p-6 md:p-8 border-b border-charcoal-black/5 flex items-center justify-between shrink-0 ${videoModalType === "youtube" ? "bg-red-50" : "bg-warm-ivory/30"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${videoModalType === "youtube" ? "bg-red-100 text-red-600" : "bg-white border border-charcoal-black/10 text-gold-accent"}`}>
                    {videoModalType === "youtube" ? <Youtube size={20} /> : <Video size={20} />}
                  </div>
                  <div>
                    <h2 className="font-playfair text-xl font-bold text-charcoal-black leading-tight">
                      {videoModalType === "youtube" ? "Link YouTube" : "Upload MP4"}
                    </h2>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${videoModalType === "youtube" ? "text-red-500" : "text-slate-gray"}`}>
                      Add to homepage reel
                    </p>
                  </div>
                </div>
                <button type="button" onClick={resetVideoModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-red-500 hover:text-white text-slate-gray transition-colors shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={videoModalType === "youtube" ? handleYoutubeSubmit : handleVideoUpload} className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                {videoModalType === "youtube" ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">YouTube URL <span className="text-red-500">*</span></label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-charcoal-black"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Video File <span className="text-red-500">*</span></label>
                    {uploadPreview ? (
                      <div className="relative aspect-video bg-charcoal-black rounded-xl overflow-hidden border border-charcoal-black/10 group">
                        <video src={uploadPreview} controls className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setUploadFile(null); setUploadPreview(null); }} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-charcoal-black/10 rounded-xl cursor-pointer hover:border-gold-accent hover:bg-gold-accent/5 transition-all bg-warm-ivory/20">
                        <Upload size={28} className="text-gold-accent mb-3" />
                        <span className="text-sm font-bold text-charcoal-black">Select Video File</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-gray mt-1">MP4, MOV (Max 100MB)</span>
                        <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Video Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Royal Palace Wedding"
                    className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Short Description</label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Briefly describe the cinematic..."
                    rows={2}
                    className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black"
                  />
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={resetVideoModal} className="px-6 py-3.5 border border-charcoal-black/10 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-warm-ivory transition-all text-charcoal-black">Cancel</button>
                <button
                  type="submit"
                  onClick={videoModalType === "youtube" ? handleYoutubeSubmit : handleVideoUpload}
                  disabled={isUploadingVideo}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 ${
                    videoModalType === "youtube" ? "bg-red-600 text-white hover:bg-red-700" : "bg-charcoal-black text-gold-accent hover:bg-gold-accent hover:text-charcoal-black"
                  }`}
                >
                  {isUploadingVideo ? <Loader color="#fff" size={14} /> : videoModalType === "youtube" ? <Youtube size={14} /> : <Upload size={14} />}
                  {isUploadingVideo ? "Processing..." : "Add to Reel"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHomepageSettings;