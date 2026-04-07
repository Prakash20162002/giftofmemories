import { useEffect, useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { X, GripVertical, Plus, Image as ImageIcon, Save, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminHero = () => {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
  });

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async ({ populateForm = true } = {}) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/hero/hero`
      );
      setHero(res.data);
      const cleared = localStorage.getItem("heroFormCleared") === "true";
      if (res.data && populateForm && !cleared) {
        setForm({
          title: res.data.title || "",
          subtitle: res.data.subtitle || "",
          buttonText: res.data.buttonText || "",
          buttonLink: res.data.buttonLink || "",
        });
        setExistingImages(res.data.images || []);
        setPreviews(res.data.images || []);
      }
    } catch (err) {
      // no hero yet is okay
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
      file,
    }));

    setNewFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev.filter((p) => typeof p === "string" || !p.isNew),
      ...prev.filter((p) => typeof p !== "string" && p.isNew),
      ...newPreviews,
    ]);

    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    const preview = previews[index];

    if (typeof preview === "string") {
      setExistingImages((prev) => prev.filter((img) => img !== preview));
    } else if (preview.isNew) {
      setNewFiles((prev) => prev.filter((f) => f !== preview.file));
      URL.revokeObjectURL(preview.url);
    }

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPreviews = [...previews];
    const draggedItem = newPreviews[draggedIndex];
    newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(index, 0, draggedItem);

    setPreviews(newPreviews);
    setDraggedIndex(index);

    const existingOnly = newPreviews.filter((p) => typeof p === "string");
    setExistingImages(existingOnly);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleClearAll = () => {
    previews.forEach((p) => {
      if (typeof p !== "string" && p.url) {
        URL.revokeObjectURL(p.url);
      }
    });

    setPreviews([]);
    setExistingImages([]);
    setNewFiles([]);
    setForm({ title: "", subtitle: "", buttonText: "", buttonLink: "" });
    localStorage.setItem("heroFormCleared", "true");
    toast.info("Form cleared. Use 'Restore' to load the current hero.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (previews.length === 0) {
      toast.error("Please add at least one image to the hero slider.");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("subtitle", form.subtitle);
      data.append("buttonText", form.buttonText);
      data.append("buttonLink", form.buttonLink);

      const existingToKeep = previews.filter((p) => typeof p === "string");
      data.append("existingImages", JSON.stringify(existingToKeep));

      newFiles.forEach((file) => {
        data.append("images", file);
      });

      if (hero && hero._id) {
        const res = await axios.put(
          `${import.meta.env.VITE_NODE_URL}/api/hero/admin/hero/${hero._id}`,
          data,
          { withCredentials: true }
        );
        setHero(res.data.hero);
        toast.success("Hero section successfully updated.");
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/hero/admin/hero`,
          data,
          { withCredentials: true }
        );
        setHero(res.data.hero);
        toast.success("Hero section successfully created.");
      }

      setForm({ title: "", subtitle: "", buttonText: "", buttonLink: "" });
      setNewFiles([]);
      setPreviews([]);
      setExistingImages([]);
      localStorage.setItem("heroFormCleared", "true");

      await fetchHero({ populateForm: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const loadHeroIntoForm = () => {
    if (!hero) return;
    setForm({
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      buttonText: hero.buttonText || "",
      buttonLink: hero.buttonLink || "",
    });
    setExistingImages(hero.images || []);
    setPreviews(hero.images || []);
    setNewFiles([]);
    localStorage.removeItem("heroFormCleared");
    toast.info("Active hero loaded into editor.");
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="px-2 md:px-0">
              <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">
                Landing Page Content
              </span>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-black">
                Manage Hero Section
              </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Form Area - Spans 2 Columns on Desktop */}
              <div className="xl:col-span-2 space-y-6">
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5 space-y-8">
                  
                  {/* Premium Structured Inputs */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Main Headline</label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Crafting Timeless Memories"
                        className="w-full px-5 py-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-playfair text-lg md:text-xl text-charcoal-black"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Subtext / Description</label>
                      <textarea
                        name="subtitle"
                        value={form.subtitle}
                        onChange={handleChange}
                        placeholder="A brief sentence below the headline..."
                        rows={3}
                        className="w-full px-5 py-4 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm text-charcoal-black resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Button Text</label>
                        <input
                          name="buttonText"
                          value={form.buttonText}
                          onChange={handleChange}
                          placeholder="e.g. View Portfolio"
                          className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm text-charcoal-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Button Destination URL</label>
                        <input
                          name="buttonLink"
                          value={form.buttonLink}
                          onChange={handleChange}
                          placeholder="e.g. /gallery"
                          className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-sm text-charcoal-black"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-charcoal-black/5 pt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-[11px] font-bold text-charcoal-black uppercase tracking-widest">Background Slider</h3>
                        <p className="text-[10px] sm:text-xs text-slate-gray mt-1">Drag to reorder • 1920x1080px Recommended</p>
                      </div>
                      
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-warm-ivory/50 border border-charcoal-black/10 text-charcoal-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gold-accent hover:text-white transition-all cursor-pointer w-full sm:w-auto">
                        <Plus size={14} /> Add Images
                        <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>

                    {/* Premium Drag and Drop Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      <AnimatePresence>
                        {previews.map((preview, index) => {
                          const imageUrl = typeof preview === "string" ? preview : preview.url;
                          const isNew = typeof preview !== "string" && preview.isNew;

                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              key={imageUrl} 
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`relative group aspect-[16/9] rounded-xl overflow-hidden cursor-move transition-all ${
                                draggedIndex === index ? "ring-2 ring-gold-accent opacity-50 scale-95" : "border border-charcoal-black/10 hover:shadow-lg"
                              }`}
                            >
                              <img src={imageUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {/* Persistent Handles & Badges */}
                              <div className="absolute top-2 left-2 p-1.5 bg-charcoal-black/80 backdrop-blur-md text-white rounded-md shadow-sm">
                                <GripVertical size={12} />
                              </div>
                              <div className="absolute bottom-2 right-2 px-2 py-1 bg-charcoal-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded-md shadow-sm">
                                {index + 1}
                              </div>
                              {isNew && (
                                <div className="absolute top-2 right-2 px-2 py-1 bg-gold-accent text-charcoal-black text-[10px] font-bold uppercase tracking-widest rounded-md shadow-sm">
                                  New
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {previews.length === 0 && (
                        <div className="col-span-full aspect-[21/9] sm:aspect-auto sm:h-32 rounded-2xl border-2 border-dashed border-charcoal-black/10 flex flex-col items-center justify-center text-slate-gray/50 bg-warm-ivory/20">
                          <ImageIcon size={24} className="mb-2" />
                          <p className="text-xs sm:text-sm font-medium text-charcoal-black">No images uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIX: Mobile-Responsive Button Area */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-charcoal-black/5 mt-auto">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="w-full sm:w-auto px-6 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl hover:bg-charcoal-black/5 transition-colors text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-center"
                    >
                      Clear Editor
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      {saving ? "Publishing..." : "Publish Hero Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Preview Area - Spans 1 Column */}
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5 sticky top-28">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal-black/5">
                    <h3 className="text-[11px] font-bold text-charcoal-black uppercase tracking-widest">Live State</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-slate-gray uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center py-12"><Loader color="#C9A24D" /></div>
                  ) : !hero ? (
                    <div className="text-center py-12 text-slate-gray">
                      <ImageIcon className="mx-auto mb-3 opacity-20" size={32} />
                      <p className="text-sm">No hero data published yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="aspect-[16/9] rounded-xl overflow-hidden bg-charcoal-black relative">
                         {hero.images && hero.images.length > 0 ? (
                           <img src={hero.images[0]} alt="Current Hero" className="w-full h-full object-cover opacity-80" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-white/30"><ImageIcon size={24} /></div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black/80 to-transparent flex flex-col justify-end p-4">
                           <h4 className="text-white font-playfair font-bold text-base md:text-lg leading-tight mb-1">{hero.title}</h4>
                           {hero.buttonText && <span className="inline-block px-3 py-1 bg-gold-accent text-charcoal-black text-[8px] font-bold uppercase tracking-widest rounded-md mt-2 w-fit">{hero.buttonText}</span>}
                         </div>
                      </div>

                      <div className="space-y-3 bg-warm-ivory/30 p-4 rounded-xl border border-charcoal-black/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-gray font-medium">Images in Rotation</span>
                          <span className="font-bold text-charcoal-black">{hero.images?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-gray font-medium">Linked To</span>
                          <span className="font-bold text-charcoal-black truncate max-w-[120px]">{hero.buttonLink || 'None'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={loadHeroIntoForm}
                        className="w-full py-3 bg-white border border-charcoal-black/10 text-charcoal-black rounded-xl hover:bg-gold-accent hover:text-white hover:border-gold-accent transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={14} />
                        Restore to Editor
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHero;