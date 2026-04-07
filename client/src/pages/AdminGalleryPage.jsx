import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Image as ImageIcon, Video, 
  Youtube, Search, X, Upload, ExternalLink, 
  Filter, Play, Save, ChevronLeft, ChevronRight
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminGalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Scrollable Category State
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState("Pre-Wedding Photoshoot");
  const [uploadPreview, setUploadPreview] = useState(null);

  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeCategory, setYoutubeCategory] = useState("Pre-Wedding Cinematic");

  const categories = [
    "All",
    "Pre-Wedding Cinematic",
    "Pre-Wedding Photoshoot",
    "Wedding Highlights",
    "Wedding Ceremony",
    "Haldi & Mehendi",
    "Sangeet Night",
    "Reception",
    "Engagement",
    "Couple Portraits",
    "Family Portraits",
    "Destination Wedding",
    "Traditional Rituals",
    "Behind The Scenes",
  ];

  // ---------------- SCROLL LOGIC ----------------
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    // Use a 2px buffer to prevent rounding errors from hiding the arrow too late
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    handleScroll(); // Check on mount
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [categories]);

  const scrollCategory = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Distance to scroll per click
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // ---------------- DATA FETCHING ----------------
  const fetchGallery = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/gallery/get-gallery`,
        { withCredentials: true }
      );
      setGalleryItems(response.data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery items");
    } finally {
      setIsLoading(false);
      // Re-evaluate scroll arrows after items load
      setTimeout(handleScroll, 100); 
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const filteredGallery = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || item.tags?.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [galleryItems, searchQuery, selectedCategory]);

  // ---------------- UPLOAD HANDLERS ----------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error("Please select an image file");

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("tags", JSON.stringify([uploadCategory]));

      await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/gallery/add-gallery`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.success("Media added to gallery");
      resetUploadModal();
      fetchGallery();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleYoutubeUpload = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return toast.error("Enter a YouTube URL");

    try {
      setIsUploading(true);
      await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/gallery/add-youtube`,
        {
          youtubeUrl,
          title: youtubeTitle,
          tags: JSON.stringify([youtubeCategory]),
        },
        { withCredentials: true }
      );

      toast.success("YouTube video integrated");
      resetYoutubeModal();
      fetchGallery();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to link video");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    if (!window.confirm("Remove this item from the gallery?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/gallery/delete-gallery/${id}`,
        { withCredentials: true }
      );
      toast.success("Item removed");
      setGalleryItems((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      toast.error("Failed to delete media");
    }
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadPreview(null);
  };

  const resetYoutubeModal = () => {
    setShowYoutubeModal(false);
    setYoutubeUrl("");
    setYoutubeTitle("");
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter overflow-x-hidden">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area - FIX: Removed w-full, added min-w-0 to prevent body horizontal scroll */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <ImageIcon className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Gallery Portfolio</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage public imagery & films</p>
                </div>
              </div>
              
              <div className="flex w-full lg:w-auto gap-3">
                <button
                  onClick={() => setShowYoutubeModal(true)}
                  className="flex-1 lg:flex-none px-5 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Youtube size={16} /> Link YouTube
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex-1 lg:flex-none px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Upload Image
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" size={18} />
                <input 
                  type="text"
                  placeholder="Search by title or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-black/10 rounded-2xl text-sm focus:ring-1 focus:ring-gold-accent outline-none shadow-sm"
                />
              </div>

              {/* FIX: Premium Scrollable Category Pills with Arrows & Invisible Scrollbar */}
              <div className="relative flex items-center group/scroll">
                
                <AnimatePresence>
                  {showLeftArrow && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => scrollCategory('left')}
                      className="absolute -left-3 z-10 p-2 bg-white/90 backdrop-blur-md border border-charcoal-black/10 rounded-full shadow-lg text-charcoal-black hover:text-gold-accent transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex gap-2 overflow-x-auto py-2 px-1 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                        selectedCategory === cat 
                          ? "bg-charcoal-black text-gold-accent shadow-md" 
                          : "bg-white border border-charcoal-black/5 text-slate-gray hover:bg-warm-ivory"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showRightArrow && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={() => scrollCategory('right')}
                      className="absolute -right-3 z-10 p-2 bg-white/90 backdrop-blur-md border border-charcoal-black/10 rounded-full shadow-lg text-charcoal-black hover:text-gold-accent transition-colors"
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
                <AnimatePresence>
                  {filteredGallery.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-xl md:rounded-[2rem] overflow-hidden shadow-sm border border-charcoal-black/5 group relative flex flex-col"
                    >
                      <div className="aspect-square overflow-hidden bg-warm-ivory relative">
                        {item.type === "youtube" ? (
                          <img
                            src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt="Gallery item"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}

                        {/* Top Right Type Badge */}
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-md p-1.5 md:p-2 rounded-lg text-charcoal-black shadow-sm">
                          {item.type === "youtube" ? <Youtube size={14} className="text-red-600" /> : <ImageIcon size={14} className="text-gold-accent" />}
                        </div>

                        {/* Hover Overlay Action (Safe Stop Propagation) */}
                        <div className="absolute inset-0 bg-charcoal-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          <button
                            onClick={(e) => handleDelete(item._id, e)}
                            className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 shadow-lg"
                            title="Delete Media"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 md:p-5 flex flex-col justify-between flex-1">
                        <p className="text-[8px] md:text-[9px] font-bold text-gold-accent uppercase tracking-widest mb-1 truncate">
                          {item.tags?.[0] || "Uncategorized"}
                        </p>
                        <h3 className="text-xs md:text-sm font-bold text-charcoal-black truncate leading-tight">
                          {item.title || "Untitled Media"}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredGallery.length === 0 && (
                  <div className="col-span-full text-center py-24 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                    <ImageIcon className="mx-auto text-slate-gray/20 mb-4" size={48} />
                    <h3 className="text-xl font-playfair font-bold text-charcoal-black">No media found</h3>
                    <p className="text-slate-gray text-sm mt-1">Adjust filters or upload new content.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---------------- UPLOAD IMAGE MODAL (z-[100]) ---------------- */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetUploadModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">Upload Image</h2>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mt-1">Add to portfolio</p>
                </div>
                <button onClick={resetUploadModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-gray hover:text-red-500 transition-colors"><X size={16} /></button>
              </div>

              <form onSubmit={handleUpload} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div 
                  className={`relative aspect-[4/3] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all ${uploadPreview ? 'border-gold-accent bg-gold-accent/5' : 'border-charcoal-black/10 hover:border-gold-accent bg-warm-ivory/20'}`}
                  onClick={() => document.getElementById('gal-img-up').click()}
                >
                  <input id="gal-img-up" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                  {uploadPreview ? (
                    <>
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                        <span className="px-4 py-2 bg-white text-charcoal-black rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg">Replace Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-gray">
                      <Upload className="mb-3 text-gold-accent" size={28} />
                      <span className="text-sm font-bold text-charcoal-black">Select High-Res Image</span>
                      <span className="text-[10px] uppercase tracking-widest mt-1 font-bold">JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Gallery Category</label>
                  <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gold-accent text-charcoal-black cursor-pointer">
                    {categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={resetUploadModal} className="px-6 py-3.5 border border-charcoal-black/10 rounded-xl font-bold text-[11px] uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-all">Cancel</button>
                <button type="submit" onClick={handleUpload} disabled={isUploading} className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg hover:bg-gold-accent hover:text-charcoal-black disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {isUploading ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} 
                  {isUploading ? "Uploading..." : "Publish Image"}
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
                  <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm outline-none focus:ring-1 focus:ring-red-500 text-charcoal-black" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Project Title <span className="text-red-500">*</span></label>
                  <input type="text" value={youtubeTitle} onChange={(e) => setYoutubeTitle(e.target.value)} placeholder="e.g. Royal Heritage Wedding" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gold-accent text-charcoal-black" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Category</label>
                  <select value={youtubeCategory} onChange={(e) => setYoutubeCategory(e.target.value)} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gold-accent text-charcoal-black cursor-pointer">
                    {categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
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
    </div>
  );
};

export default AdminGalleryPage;