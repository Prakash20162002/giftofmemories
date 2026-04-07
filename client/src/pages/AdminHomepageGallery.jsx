import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit2,
  X,
  Plus,
  Grid3X3,
  Layers,
  LayoutList,
  Save,
  Images,
  Eye,
  EyeOff
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminHomepageGallery = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("parallax");
  
  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    section: "parallax",
    alt: "",
    category: "",
    order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkPreviews, setBulkPreviews] = useState([]);

  // Premium Section Config
  const sectionConfig = {
    parallax: {
      label: "Parallax Intro",
      icon: Layers,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      description: "Horizontal scrolling rows that respond to user scroll.",
    },
    scroll: {
      label: "Narrative Scroll",
      icon: LayoutList,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      description: "Images appearing alongside the studio story text.",
    },
    stacked: {
      label: "Stacked Cards",
      icon: Grid3X3,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      description: "Vertical stacked cards that fan out on scroll.",
    },
  };

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/admin/get-all`,
        { withCredentials: true }
      );
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load gallery items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const filteredImages = images.filter(
    (img) => img.section === selectedSection
  ).sort((a, b) => a.order - b.order);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBulkImageChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FILES = 20;
    const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB

    if (files.length > MAX_FILES) {
      return toast.error(`Maximum ${MAX_FILES} images allowed per upload`);
    }

    let totalSize = 0;
    const oversizedFiles = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) oversizedFiles.push(file.name);
      totalSize += file.size;
    }

    if (oversizedFiles.length > 0) {
      return toast.error(`${oversizedFiles.length} file(s) exceed 10MB limit`);
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return toast.error(`Total size exceeds 200MB limit`);
    }

    setBulkFiles(files);
    setBulkPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const openAddModal = () => {
    setEditingImage(null);
    setFormData({
      section: selectedSection,
      alt: "",
      category: "",
      order: filteredImages.length,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (image) => {
    setEditingImage(image);
    setFormData({
      section: image.section,
      alt: image.alt || "",
      category: image.category || "",
      order: image.order || 0,
    });
    setImagePreview(image.imageUrl);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("section", formData.section);
      formDataToSend.append("alt", formData.alt);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("order", formData.order);
      if (imageFile) formDataToSend.append("image", imageFile);

      if (editingImage) {
        await axios.put(
          `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/admin/update/${editingImage._id}`,
          formDataToSend,
          { withCredentials: true }
        );
        toast.success("Image updated");
      } else {
        if (!imageFile) {
          toast.error("Please select an image");
          setIsSaving(false);
          return;
        }
        await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/admin/add`,
          formDataToSend,
          { withCredentials: true }
        );
        toast.success("Image added");
      }

      setIsModalOpen(false);
      fetchImages();
    } catch (error) {
      toast.error("Failed to save image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) return toast.error("Select images to upload");
    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("section", selectedSection);
      bulkFiles.forEach((file) => formDataToSend.append("images", file));

      await axios.post(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/admin/bulk-upload`,
        formDataToSend,
        { withCredentials: true }
      );

      toast.success(`${bulkFiles.length} images uploaded`);
      setIsBulkModalOpen(false);
      setBulkFiles([]);
      setBulkPreviews([]);
      fetchImages();
    } catch (error) {
      toast.error("Failed to process bulk upload");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this image?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/admin/delete/${id}`,
        { withCredentials: true }
      );
      toast.success("Image deleted");
      setImages((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const toggleImageStatus = async (image) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("isActive", !image.isActive);

      await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/admin/update/${image._id}`,
        formDataToSend,
        { withCredentials: true }
      );
      toast.success(`Image ${image.isActive ? "hidden" : "published"}`);
      fetchImages();
    } catch (error) {
      toast.error("Failed to update status");
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
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <span className="text-slate-gray text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">
                  Layout Structure
                </span>
                <h1 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-black">
                  Homepage Galleries
                </h1>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex-1 md:flex-none px-5 py-3 bg-white border border-charcoal-black/10 text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal-black hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Images size={16} /> Bulk Upload
                </button>
                <button
                  onClick={openAddModal}
                  className="flex-1 md:flex-none px-5 py-3 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Single Image
                </button>
              </div>
            </div>

            {/* Premium Section Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(sectionConfig).map(([key, config]) => {
                const Icon = config.icon;
                const count = images.filter((img) => img.section === key).length;
                const isSelected = selectedSection === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSection(key)}
                    className={`flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all text-left ${
                      isSelected
                        ? "bg-charcoal-black border-charcoal-black shadow-xl scale-[1.02]"
                        : "bg-white border-charcoal-black/5 hover:border-gold-accent/50 hover:bg-warm-ivory/50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? 'bg-white/10 border-white/5 text-gold-accent' : config.color}`}>
                      <Icon size={20} strokeWidth={isSelected ? 2 : 1.5} />
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${isSelected ? 'text-white' : 'text-charcoal-black'}`}>
                        {config.label}
                      </h3>
                      <p className={`text-xs line-clamp-2 leading-relaxed ${isSelected ? 'text-white/60' : 'text-slate-gray'}`}>
                        {config.description}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-3 ${isSelected ? 'text-gold-accent' : 'text-slate-gray/50'}`}>
                        {count} Media Items
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Gallery Grid */}
            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {filteredImages.map((image) => (
                    <motion.div
                      key={image._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-charcoal-black/5 group relative transition-all ${
                        !image.isActive ? "grayscale opacity-60 hover:grayscale-0 hover:opacity-100" : ""
                      }`}
                    >
                      <div className="relative aspect-[4/3] bg-warm-ivory/50 overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.alt || "Gallery Image"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-charcoal-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                            #{image.order}
                          </span>
                          {!image.isActive && (
                            <span className="bg-red-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                              <EyeOff size={10} /> Hidden
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-charcoal-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          <button
                            onClick={() => toggleImageStatus(image)}
                            className="w-10 h-10 bg-white/10 hover:bg-white text-white hover:text-charcoal-black rounded-full flex items-center justify-center transition-colors border border-white/20"
                            title={image.isActive ? "Hide Image" : "Publish Image"}
                          >
                            {image.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => openEditModal(image)}
                            className="w-10 h-10 bg-white/10 hover:bg-gold-accent text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(image._id)}
                            className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white flex flex-col justify-between">
                        <p className="font-bold text-sm text-charcoal-black truncate mb-1">
                          {image.alt || "Untitled Image"}
                        </p>
                        {image.category && (
                          <span className="text-[10px] font-bold text-gold-accent uppercase tracking-widest truncate">
                            {image.category}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredImages.length === 0 && (
                  <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                    <ImageIcon className="mx-auto text-slate-gray/20 mb-4" size={48} />
                    <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">
                      No images in {sectionConfig[selectedSection].label}
                    </h3>
                    <p className="text-slate-gray text-sm mb-4">Upload photography to build this layout.</p>
                    <button onClick={openAddModal} className="text-[11px] font-bold uppercase tracking-widest text-gold-accent hover:text-charcoal-black transition-colors">
                      + Add First Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---------------- COMPACT SINGLE UPLOAD MODAL ---------------- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            
            {/* FIX: Removed overflow-y-auto and max-h to make it a solid, fitted card */}
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10">
              
              <div className="p-6 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center rounded-t-[2rem]">
                <div>
                  <h3 className="font-playfair text-xl font-bold text-charcoal-black">
                    {editingImage ? "Edit Image Settings" : "Upload to Gallery"}
                  </h3>
                  <p className="text-[10px] font-bold text-gold-accent uppercase tracking-widest mt-0.5">
                    Target: {sectionConfig[formData.section].label}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-sm text-slate-gray hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* FIX: Reduced padding and gap spacing */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* FIX: Fixed height image dropzone */}
                <div 
                  className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${imagePreview ? 'border-gold-accent bg-gold-accent/5' : 'border-charcoal-black/10 hover:border-gold-accent bg-warm-ivory/20'}`}
                  onClick={() => document.getElementById("image-upload").click()}
                >
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {imagePreview ? (
                    <div className="relative group w-full h-full p-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain drop-shadow-sm rounded-xl" />
                      <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-2xl">
                        <span className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-charcoal-black shadow-sm">Replace</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="mb-2 text-gold-accent" size={24} />
                      <span className="text-sm font-bold text-charcoal-black">Select Image</span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-gray mt-1">High-res JPG/PNG</span>
                    </div>
                  )}
                </div>

                {/* FIX: Compact Grid Layout for Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-4 py-2.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                    >
                      {Object.entries(sectionConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Alt Text (SEO)</label>
                    <input
                      type="text"
                      value={formData.alt}
                      onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                      placeholder="Describe image for search engines..."
                      className="w-full px-4 py-2.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                    />
                  </div>

                  {formData.section === "stacked" && (
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Card Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Wedding, Pre-Wedding"
                        className="w-full px-4 py-2.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isSaving} className="w-full py-3.5 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg disabled:opacity-50">
                    {isSaving ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />}
                    {editingImage ? "Update Settings" : "Upload & Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- Bulk Upload Modal ---------------- */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBulkModalOpen(false)} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-charcoal-black">
                    Bulk Upload
                  </h3>
                  <p className="text-[10px] font-bold text-gold-accent uppercase tracking-widest mt-1">Target: {sectionConfig[selectedSection].label}</p>
                </div>
                <button onClick={() => { setIsBulkModalOpen(false); setBulkFiles([]); setBulkPreviews([]); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-sm text-slate-gray hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                {/* Guidelines */}
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-[11px] uppercase tracking-widest text-amber-800 mb-2">Upload Rules</h4>
                  <ul className="text-xs text-amber-700/80 space-y-1.5 font-medium">
                    <li>• Max 20 images per batch</li>
                    <li>• Under 10MB per individual image</li>
                    <li>• Auto-assigned to <strong className="text-amber-900">{sectionConfig[selectedSection].label}</strong></li>
                  </ul>
                </div>

                {/* Dropzone */}
                <div 
                  onClick={() => document.getElementById("bulk-upload").click()}
                  className="border-2 border-dashed border-charcoal-black/10 rounded-2xl p-10 text-center cursor-pointer hover:border-gold-accent hover:bg-gold-accent/5 transition-colors mb-6"
                >
                  <Images className="w-12 h-12 text-gold-accent mx-auto mb-3" />
                  <p className="font-bold text-charcoal-black">Select Multiple Files</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-gray mt-2">JPG, PNG, WebP accepted</p>
                  <input id="bulk-upload" type="file" accept="image/*" multiple onChange={handleBulkImageChange} className="hidden" />
                </div>

                {/* Preview Area */}
                {bulkPreviews.length > 0 && (
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">Preview Queue</p>
                      <span className="text-xs font-bold text-charcoal-black">{bulkFiles.length} files</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {bulkPreviews.map((preview, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-charcoal-black/5 shadow-sm relative group">
                          <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0">
                <button
                  onClick={handleBulkUpload}
                  disabled={isSaving || bulkFiles.length === 0}
                  className="w-full py-4 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg disabled:opacity-50"
                >
                  {isSaving ? <Loader color="#C9A24D" size={16} /> : <Upload size={16} />}
                  {isSaving ? "Uploading Library..." : `Upload ${bulkFiles.length > 0 ? bulkFiles.length : ''} Images`}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHomepageGallery;