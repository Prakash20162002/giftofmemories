import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Video,
  Youtube,
  Edit2,
  Eye,
  EyeOff,
  X,
  Upload,
  Play,
  Film,
  Layers,
  Save
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminPageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Layout State
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingVideo, setEditingVideo] = useState(null);

  // Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadPageType, setUploadPageType] = useState("services");
  const [uploadPreview, setUploadPreview] = useState(null);

  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeDescription, setYoutubeDescription] = useState("");
  const [youtubePageType, setYoutubePageType] = useState("services");

  const pageTypes = [
    { value: "services", label: "Services Page", description: "How to use our services" },
    { value: "shop", label: "Shop Page", description: "How to buy products" },
    { value: "booking", label: "Booking Page", description: "How to book services" },
    { value: "service-details", label: "Service Details", description: "Service tutorials" },
    { value: "product-details", label: "Product Details", description: "Product guides" },
  ];

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/page-videos/admin/all`,
        { withCredentials: true }
      );
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load video library");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // ---------------- HANDLERS ----------------

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        return toast.error("Please select a valid video file");
      }
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error("Please attach a video file");
    if (!uploadTitle.trim()) return toast.error("Please enter a title");

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("video", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      formData.append("pageType", uploadPageType);

      await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/page-videos/add`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.success("Video published successfully");
      resetUploadModal();
      fetchVideos();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleYoutubeUpload = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return toast.error("Please enter a YouTube URL");
    if (!youtubeTitle.trim()) return toast.error("Please enter a title");

    try {
      setIsUploading(true);
      await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/page-videos/add-youtube`,
        {
          youtubeUrl,
          title: youtubeTitle,
          description: youtubeDescription,
          pageType: youtubePageType,
        },
        { withCredentials: true }
      );

      toast.success("YouTube video integrated");
      resetYoutubeModal();
      fetchVideos();
    } catch (error) {
      toast.error("Failed to add YouTube video");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      setIsUploading(true);
      await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/page-videos/update/${editingVideo._id}`,
        {
          title: editingVideo.title,
          description: editingVideo.description,
          pageType: editingVideo.pageType,
        },
        { withCredentials: true }
      );

      toast.success("Settings updated");
      setShowEditModal(false);
      setEditingVideo(null);
      fetchVideos();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleStatus = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.patch(
        `${import.meta.env.VITE_NODE_URL}/api/page-videos/toggle-status/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success("Visibility toggled");
      setVideos((prev) =>
        prev.map((v) => (v._id === id ? { ...v, isActive: !v.isActive } : v))
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Permanently delete this video?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/page-videos/delete/${id}`,
        { withCredentials: true }
      );
      toast.success("Video removed");
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadPageType("services");
    setUploadPreview(null);
  };

  const resetYoutubeModal = () => {
    setShowYoutubeModal(false);
    setYoutubeUrl("");
    setYoutubeTitle("");
    setYoutubeDescription("");
    setYoutubePageType("services");
  };

  const filteredVideos = activeFilter === "all" ? videos : videos.filter((v) => v.pageType === activeFilter);

  const getPageLabel = (type) => {
    const found = pageTypes.find((p) => p.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter overflow-x-hidden">
      {/* Connected Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Responsive Content Wrapper */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Film className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Contextual Videos</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage page-specific tutorials & cinematics</p>
                </div>
              </div>
              
              <div className="flex w-full md:w-auto gap-3">
                <button
                  onClick={() => setShowYoutubeModal(true)}
                  className="flex-1 md:flex-none px-5 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Youtube size={16} /> Add YouTube
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex-1 md:flex-none px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Upload size={16} /> Upload MP4
                </button>
              </div>
            </div>

            {/* Premium Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-charcoal-black text-gold-accent shadow-md"
                    : "bg-white border border-charcoal-black/5 text-slate-gray hover:bg-warm-ivory"
                }`}
              >
                All Pages
              </button>
              {pageTypes.map((page) => (
                <button
                  key={page.value}
                  onClick={() => setActiveFilter(page.value)}
                  className={`px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeFilter === page.value
                      ? "bg-charcoal-black text-gold-accent shadow-md"
                      : "bg-white border border-charcoal-black/5 text-slate-gray hover:bg-warm-ivory"
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>

            {/* Videos Grid */}
            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                <Film size={48} className="mx-auto text-slate-gray/20 mb-4" />
                <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">No videos found</h3>
                <p className="text-slate-gray text-sm">Upload or link tutorials for this section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {filteredVideos.map((video) => (
                    <motion.div
                      key={video._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-charcoal-black/5 group flex flex-col transition-all ${
                        !video.isActive ? "grayscale opacity-70" : "hover:shadow-md"
                      }`}
                    >
                      {/* Thumbnail Area */}
                      <div className="relative aspect-video bg-warm-ivory overflow-hidden">
                        {video.videoType === "youtube" ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <video
                            src={video.videoUrl}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        
                        <div className="absolute inset-0 bg-charcoal-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                            <Play size={20} className="text-charcoal-black ml-1" fill="currentColor" />
                          </div>
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white shadow-sm backdrop-blur-md ${video.videoType === "youtube" ? "bg-red-600/90" : "bg-gold-accent/90"}`}>
                            {video.videoType === "youtube" ? "YouTube" : "MP4 Upload"}
                          </span>
                        </div>

                        {!video.isActive && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-red-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                              <EyeOff size={10} /> Hidden
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content & Actions */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-4 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-gray block mb-1">
                            {getPageLabel(video.pageType)}
                          </span>
                          <h3 className="font-bold text-sm text-charcoal-black line-clamp-1 mb-1">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-xs text-slate-gray line-clamp-2 leading-relaxed">
                              {video.description}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-charcoal-black/5 mt-auto">
                          <button
                            onClick={() => { setEditingVideo(video); setShowEditModal(true); }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-warm-ivory/50 text-charcoal-black hover:bg-gold-accent hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={(e) => handleToggleStatus(video._id, e)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest ${
                              video.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {video.isActive ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}
                          </button>
                          <button
                            onClick={(e) => handleDelete(video._id, e)}
                            className="w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---------------- UPLOAD MP4 MODAL (z-[100]) ---------------- */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetUploadModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
              
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">Upload MP4</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Direct server upload</p>
                </div>
                <button onClick={resetUploadModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Video File <span className="text-red-500">*</span></label>
                  {uploadPreview ? (
                    <div className="relative aspect-video bg-charcoal-black rounded-2xl overflow-hidden border border-charcoal-black/10 group shadow-sm max-h-56">
                      <video src={uploadPreview} controls className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setUploadFile(null); setUploadPreview(null); }} className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg hover:bg-red-600 transition-colors z-10">
                        <X size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video max-h-56 border-2 border-dashed border-charcoal-black/10 rounded-2xl cursor-pointer hover:border-gold-accent hover:bg-gold-accent/5 transition-all bg-warm-ivory/20">
                      <Upload size={28} className="text-gold-accent mb-3" />
                      <span className="text-sm font-bold text-charcoal-black">Select Video File</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">MP4, MOV (Max 100MB)</span>
                      <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. How to book our services" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Target Page</label>
                  <select value={uploadPageType} onChange={(e) => setUploadPageType(e.target.value)} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black cursor-pointer">
                    {pageTypes.map((page) => <option key={page.value} value={page.value}>{page.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Provide context..." rows={3} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={resetUploadModal} className="px-6 py-3.5 border border-charcoal-black/10 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-warm-ivory transition-all text-charcoal-black">Cancel</button>
                <button type="button" onClick={handleUpload} disabled={isUploading} className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {isUploading ? <Loader color="#C9A24D" size={14} /> : <Upload size={14} />}
                  {isUploading ? "Uploading..." : "Publish Video"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- YOUTUBE MODAL (z-[100]) ---------------- */}
      <AnimatePresence>
        {showYoutubeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetYoutubeModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-red-50 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">Link YouTube</h2>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Embed external cinematic</p>
                </div>
                <button onClick={resetYoutubeModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleYoutubeUpload} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">YouTube URL <span className="text-red-500">*</span></label>
                  <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-charcoal-black" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Project Title <span className="text-red-500">*</span></label>
                  <input type="text" value={youtubeTitle} onChange={(e) => setYoutubeTitle(e.target.value)} placeholder="e.g. Royal Heritage Wedding" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Target Page</label>
                  <select value={youtubePageType} onChange={(e) => setYoutubePageType(e.target.value)} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent text-charcoal-black cursor-pointer">
                    {pageTypes.map((page) => <option key={page.value} value={page.value}>{page.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea value={youtubeDescription} onChange={(e) => setYoutubeDescription(e.target.value)} placeholder="Briefly describe the cinematic..." rows={3} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={resetYoutubeModal} className="px-6 py-3.5 border border-charcoal-black/10 rounded-xl font-bold text-[11px] uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-all">Cancel</button>
                <button type="submit" onClick={handleYoutubeUpload} disabled={isUploading} className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {isUploading ? <Loader color="#fff" size={14} /> : <Youtube size={14} />} 
                  {isUploading ? "Linking..." : "Embed Video"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- EDIT MODAL (z-[100]) ---------------- */}
      <AnimatePresence>
        {showEditModal && editingVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowEditModal(false); setEditingVideo(null); }} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">Edit Video Data</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Modify title and routing</p>
                </div>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingVideo(null); }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleEdit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                <div className="aspect-video bg-charcoal-black rounded-2xl overflow-hidden border border-charcoal-black/10 shadow-sm max-h-56">
                  {editingVideo.videoType === "youtube" ? (
                    <iframe src={`https://www.youtube.com/embed/${editingVideo.youtubeId}`} className="w-full h-full" allowFullScreen />
                  ) : (
                    <video src={editingVideo.videoUrl} controls className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Title</label>
                  <input type="text" value={editingVideo.title} onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Target Page</label>
                  <select value={editingVideo.pageType} onChange={(e) => setEditingVideo({ ...editingVideo, pageType: e.target.value })} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black cursor-pointer">
                    {pageTypes.map((page) => <option key={page.value} value={page.value}>{page.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Description</label>
                  <textarea value={editingVideo.description || ""} onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })} rows={3} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingVideo(null); }} className="px-6 py-3.5 border border-charcoal-black/10 rounded-xl font-bold text-[11px] uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-all">Cancel</button>
                <button type="button" onClick={handleEdit} disabled={isUploading} className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {isUploading ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} 
                  {isUploading ? "Updating..." : "Save Changes"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminPageVideos;