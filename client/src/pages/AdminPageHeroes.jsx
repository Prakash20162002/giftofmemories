import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Save,
  Upload,
  X,
  Briefcase,
  ShoppingBag,
  BookOpen,
  Phone,
  RotateCcw,
  Users,
  LayoutTemplate
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminPageHeroes = () => {
  const [heroes, setHeroes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    breadcrumb: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const pageConfig = {
    services: {
      label: "Services Page",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    shop: {
      label: "Shop Page",
      icon: ShoppingBag,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    blog: {
      label: "Journal / Blog",
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    about: {
      label: "Studio Story",
      icon: Users,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    contact: {
      label: "Contact Page",
      icon: Phone,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
  };

  const fetchHeroes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/page-hero/admin/get-all`,
        { withCredentials: true }
      );
      setHeroes(response.data || []);
    } catch (error) {
      console.error("Error fetching page heroes:", error);
      toast.error("Failed to load page data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  const handleSelectPage = (page) => {
    const hero = heroes.find((h) => h.page === page);
    setSelectedPage(page);
    
    // Auto-fill defaults for Shop if the database is completely empty
    if (!hero && page === 'shop') {
      setFormData({
        title: "Luxury Wedding Collection",
        subtitle: "",
        description: "Crafted for love, designed to last forever.",
        breadcrumb: "Gift of Memories • Shop",
      });
    } else {
      setFormData({
        title: hero?.title || "",
        subtitle: hero?.subtitle || "",
        description: hero?.description || "",
        breadcrumb: hero?.breadcrumb || "",
      });
    }
    
    setImagePreview(hero?.backgroundImage || null);
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    try {
      setIsSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("subtitle", formData.subtitle);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("breadcrumb", formData.breadcrumb);
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/page-hero/admin/update/${selectedPage}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(`${pageConfig[selectedPage].label} updated!`);
      fetchHeroes();
    } catch (error) {
      console.error("Error saving page hero:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedPage) return;

    if (!window.confirm("Are you sure you want to revert this to the studio default?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/page-hero/admin/reset/${selectedPage}`,
        { withCredentials: true }
      );

      toast.success("Page reverted to default template");
      setFormData({
        title: response.data.hero?.title || "",
        subtitle: response.data.hero?.subtitle || "",
        description: response.data.hero?.description || "",
        breadcrumb: response.data.hero?.breadcrumb || "",
      });
      setImagePreview(null);
      setImageFile(null);
      fetchHeroes();
    } catch (error) {
      console.error("Error resetting page hero:", error);
      toast.error("Failed to reset template");
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader color="#C9A24D" /></div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                    <LayoutTemplate className="text-gold-accent" size={24} />
                  </div>
                  <div>
                    <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Sub-Page Banners</h1>
                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage secondary page heroes</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="font-playfair text-xl font-bold text-charcoal-black px-2 mb-4">Select Target</h3>
                  <div className="space-y-3">
                    {/* Always render the config options, even if the DB hasn't created them yet */}
                    {Object.entries(pageConfig).map(([page, config]) => {
                      const Icon = config.icon;
                      const hero = heroes.find((h) => h.page === page);
                      const isSelected = selectedPage === page;

                      return (
                        <button
                          key={page}
                          onClick={() => handleSelectPage(page)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                            isSelected
                              ? "bg-charcoal-black border-charcoal-black shadow-xl scale-[1.02]"
                              : "bg-white border-charcoal-black/5 hover:border-gold-accent/50 hover:bg-warm-ivory/50"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? 'bg-white/10 border-white/5 text-gold-accent' : config.color}`}>
                            <Icon size={18} strokeWidth={isSelected ? 2 : 1.5} />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-charcoal-black'}`}>
                              {config.label}
                            </h4>
                            <p className={`text-[10px] uppercase tracking-widest mt-1 font-bold ${isSelected ? 'text-white/50' : 'text-slate-gray/50'}`}>
                              {hero?.isDefault === false ? "Customized" : "Default Theme"}
                            </p>
                          </div>
                          
                          {hero?.isDefault === false && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    {selectedPage ? (
                      <motion.div
                        key={selectedPage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden"
                      >
                        <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-playfair text-2xl font-bold text-charcoal-black">
                              Edit {pageConfig[selectedPage].label}
                            </h3>
                          </div>
                          <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-charcoal-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-charcoal-black hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                          >
                            <RotateCcw size={14} /> Revert to Default
                          </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                              Background Imagery
                            </label>
                            
                            {imagePreview ? (
                              <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden group shadow-sm">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                  <button
                                    onClick={handleRemoveImage}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg"
                                  >
                                    <X size={14} /> Remove Image
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full aspect-[21/9] md:aspect-[3/1] border-2 border-dashed border-charcoal-black/10 rounded-2xl cursor-pointer hover:border-gold-accent hover:bg-gold-accent/5 transition-all bg-warm-ivory/20">
                                <Upload className="w-8 h-8 text-gold-accent mb-3" />
                                <span className="text-sm font-bold text-charcoal-black">Upload New Background</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">1920x1080px Recommended</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                              </label>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Page Title</label>
                                <input
                                  type="text"
                                  value={formData.title}
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                  placeholder="e.g. Our Services"
                                  className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-playfair text-lg text-charcoal-black"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Breadcrumb Location</label>
                                <input
                                  type="text"
                                  value={formData.breadcrumb}
                                  onChange={(e) => setFormData({ ...formData, breadcrumb: e.target.value })}
                                  placeholder="e.g. Gift of Memories • Services"
                                  className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Accent Subtitle</label>
                              <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="A brief, punchy statement"
                                className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-charcoal-black"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Description Paragraph</label>
                              <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Describe the purpose of this page..."
                                className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all font-inter text-charcoal-black resize-none"
                              />
                            </div>
                          </div>

                          <div className="pt-6 border-t border-charcoal-black/5 flex justify-end">
                            <button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="w-full md:w-auto px-8 py-4 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isSaving ? <Loader color="#C9A24D" size={16} /> : <Save size={16} />}
                              {isSaving ? "Publishing..." : "Publish Page Hero"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 flex flex-col items-center justify-center p-12 text-center min-h-[400px]"
                      >
                        <div className="w-20 h-20 bg-warm-ivory rounded-full flex items-center justify-center text-gold-accent mb-6 shadow-sm">
                          <LayoutTemplate size={32} />
                        </div>
                        <h3 className="font-playfair text-2xl font-bold text-charcoal-black mb-2">
                          Select a Template
                        </h3>
                        <p className="text-slate-gray max-w-sm text-sm">
                          Choose a page from the left sidebar to customize its header image, title, and descriptive text.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPageHeroes;