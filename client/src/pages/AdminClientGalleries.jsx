import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Save,
  Grid,
  Eye,
  EyeOff
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useConfirm } from "../context/ConfirmContext";

const AdminClientGalleries = () => {
  const confirm = useConfirm();
  const [galleries, setGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    category: "Wedding",
    isActive: true,
  });
  
  // File Upload States
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);

  // Edit-only Delete Image tracking
  const [deletedImagesQueue, setDeletedImagesQueue] = useState([]);

  const categories = [
    "Wedding",
    "Pre-Wedding Photoshoot",
    "Haldi & Mehendi",
    "Sangeet Night",
    "Reception",
    "Engagement",
    "Couple Portraits"
  ];

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/client-gallery/admin/get-all`,
        { withCredentials: true }
      );
      setGalleries(res.data);
    } catch (error) {
      console.error("Error fetching client galleries:", error);
      toast.error("Failed to load client galleries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesFiles((prev) => [...prev, ...files]);
    setImagesPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeNewImageFile = (index) => {
    setImagesFiles((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingGallery(null);
    setFormData({
      name: "",
      category: "Wedding",
      isActive: true,
    });
    setCoverFile(null);
    setCoverPreview(null);
    setImagesFiles([]);
    setImagesPreviews([]);
    setDeletedImagesQueue([]);
    setIsModalOpen(true);
  };

  const openEditModal = (gallery) => {
    setEditingGallery(gallery);
    setFormData({
      name: gallery.name,
      category: gallery.category,
      isActive: gallery.isActive ?? true,
    });
    setCoverPreview(gallery.coverImage);
    setCoverFile(null);
    setImagesFiles([]);
    setImagesPreviews([]);
    setDeletedImagesQueue([]);
    setIsModalOpen(true);
  };

  const toggleGalleryActiveStatus = async (gallery) => {
    try {
      const data = new FormData();
      data.append("isActive", !gallery.isActive);

      await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/client-gallery/admin/update/${gallery._id}`,
        data,
        { withCredentials: true }
      );
      toast.success(`Gallery ${gallery.isActive ? "hidden" : "published"}`);
      fetchGalleries();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!(await confirm("Are you sure you want to permanently delete this client gallery and all its images?"))) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/client-gallery/admin/delete/${id}`,
        { withCredentials: true }
      );
      toast.success("Client gallery deleted successfully");
      setGalleries((prev) => prev.filter((g) => g._id !== id));
    } catch (error) {
      toast.error("Failed to delete gallery");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Please enter a name");
    
    setIsSaving(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("category", formData.category);
      submitData.append("isActive", formData.isActive);

      if (coverFile) submitData.append("coverImage", coverFile);
      imagesFiles.forEach((file) => submitData.append("images", file));

      if (editingGallery) {
        if (deletedImagesQueue.length > 0) {
          submitData.append("deletedImages", JSON.stringify(deletedImagesQueue));
        }
        await axios.put(
          `${import.meta.env.VITE_NODE_URL}/api/client-gallery/admin/update/${editingGallery._id}`,
          submitData,
          { withCredentials: true }
        );
        toast.success("Client gallery updated successfully");
      } else {
        if (!coverFile) {
          toast.error("Please upload a cover image");
          setIsSaving(false);
          return;
        }
        await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/client-gallery/admin/create`,
          submitData,
          { withCredentials: true }
        );
        toast.success("Client gallery created successfully");
      }

      setIsModalOpen(false);
      fetchGalleries();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save client gallery");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleQueueDelete = (url) => {
    if (deletedImagesQueue.includes(url)) {
      setDeletedImagesQueue((prev) => prev.filter((item) => item !== url));
    } else {
      setDeletedImagesQueue((prev) => [...prev, url]);
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Grid className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">
                    Client Galleries
                  </h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">
                    Manage client albums and wedding stories
                  </p>
                </div>
              </div>
              <button
                onClick={openAddModal}
                className="w-full sm:w-auto px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Create Gallery
              </button>
            </div>

            {/* List Grid */}
            {isLoading ? (
              <div className="flex justify-center py-32">
                <Loader color="#C9A24D" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {galleries.map((gallery) => (
                  <div
                    key={gallery._id}
                    className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border border-charcoal-black/5 group relative flex flex-col transition-all ${
                      !gallery.isActive ? "opacity-60 grayscale hover:opacity-100 hover:grayscale-0" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-warm-ivory/50 overflow-hidden">
                      <img
                        src={gallery.coverImage}
                        alt={gallery.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-charcoal-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm">
                          {gallery.category}
                        </span>
                        {!gallery.isActive && (
                          <span className="bg-red-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-sm uppercase">
                            <EyeOff size={10} /> Hidden
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-charcoal-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button
                          onClick={() => toggleGalleryActiveStatus(gallery)}
                          className="w-10 h-10 bg-white/10 hover:bg-white text-white hover:text-charcoal-black rounded-full flex items-center justify-center transition-colors border border-white/20"
                          title={gallery.isActive ? "Hide Album" : "Publish Album"}
                        >
                          {gallery.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => openEditModal(gallery)}
                          className="w-10 h-10 bg-white/10 hover:bg-gold-accent text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
                          title="Edit Album"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGallery(gallery._id)}
                          className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
                          title="Delete Album"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-playfair text-lg font-bold text-charcoal-black leading-snug mb-1">
                          {gallery.name}
                        </h3>
                        <p className="text-xs text-slate-gray">
                          {gallery.images?.length || 0} Secondary Photos
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {galleries.length === 0 && (
                  <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                    <ImageIcon className="mx-auto text-slate-gray/20 mb-4" size={48} />
                    <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">
                      No Client Galleries Found
                    </h3>
                    <p className="text-slate-gray text-sm mb-4">Create your first client album to show multi-photo stories.</p>
                    <button onClick={openAddModal} className="text-[11px] font-bold uppercase tracking-widest text-gold-accent hover:text-charcoal-black transition-colors">
                      + Add First Gallery
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---------------- CREATE / EDIT MODAL ---------------- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isSaving) setIsModalOpen(false); }}
              className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-playfair text-2xl font-bold text-charcoal-black">
                    {editingGallery ? "Edit Client Gallery" : "Create Client Gallery"}
                  </h3>
                  <p className="text-[10px] font-bold text-gold-accent uppercase tracking-widest mt-1">
                    {editingGallery ? "Update details & manage photos" : "Upload cover and multi-photo sets"}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-sm text-slate-gray hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Name & Category Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Album Title / Couple Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Srinjoy & Shalini"
                      className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none text-charcoal-black"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Event Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:ring-1 focus:ring-gold-accent outline-none text-charcoal-black"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">Cover Image (Homepage card visual)</label>
                  <div 
                    className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${coverPreview ? 'border-gold-accent bg-gold-accent/5' : 'border-charcoal-black/10 hover:border-gold-accent bg-warm-ivory/20'}`}
                    onClick={() => document.getElementById("cover-image-upload").click()}
                  >
                    <input id="cover-image-upload" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    {coverPreview ? (
                      <div className="relative w-full h-full p-2">
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-contain drop-shadow-sm rounded-xl mx-auto" />
                        <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all rounded-2xl">
                          <span className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-charcoal-black shadow-sm">Replace Cover</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <Upload className="mb-2 text-gold-accent" size={24} />
                        <span className="text-sm font-bold text-charcoal-black">Upload Cover Image</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-gray mt-1">Recommended aspect ratio 4:3</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary Images Upload */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-charcoal-black uppercase tracking-widest ml-1">
                      Secondary Photos (The wedding collection)
                    </label>
                    <button
                      type="button"
                      onClick={() => document.getElementById("secondary-images-upload").click()}
                      className="px-3 py-1.5 border border-gold-accent/50 text-gold-accent hover:bg-gold-accent hover:text-charcoal-black rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                    >
                      <Plus size={10} /> Add Files
                    </button>
                    <input id="secondary-images-upload" type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                  </div>

                  {/* Existing Images (Edit Only) */}
                  {editingGallery && editingGallery.images?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase text-slate-gray tracking-wider">Already In Album ({editingGallery.images.length})</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 border border-charcoal-black/5 p-4 rounded-2xl bg-warm-ivory/10 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {editingGallery.images.map((url, idx) => {
                          const isQueuedForDelete = deletedImagesQueue.includes(url);
                          return (
                            <div 
                              key={idx} 
                              onClick={() => toggleQueueDelete(url)}
                              className={`aspect-square rounded-lg overflow-hidden border border-charcoal-black/5 shadow-sm relative group cursor-pointer ${
                                isQueuedForDelete ? "opacity-25 grayscale line-through border-red-500 border-2" : ""
                              }`}
                            >
                              <img src={url} alt={`Gallery item ${idx}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-charcoal-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <Trash2 size={14} className={isQueuedForDelete ? "text-green-500" : "text-red-500"} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {deletedImagesQueue.length > 0 && (
                        <p className="text-[10px] text-red-500 font-medium ml-1">
                          * {deletedImagesQueue.length} photo(s) selected to delete on save.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Newly Selected Images Previews */}
                  {imagesPreviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase text-slate-gray tracking-wider">Newly Selected to Add ({imagesPreviews.length})</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 border border-gold-accent/10 p-4 rounded-2xl bg-gold-accent/5 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {imagesPreviews.map((preview, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border border-charcoal-black/5 shadow-sm relative group">
                            <img src={preview} alt={`New upload preview ${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeNewImageFile(index)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>

              {/* Footer Actions */}
              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-6 py-3.5 border border-charcoal-black/10 rounded-xl font-bold text-[11px] uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-8 py-3.5 bg-charcoal-black text-gold-accent rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-gold-accent hover:text-charcoal-black shadow-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader color="#C9A24D" size={14} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Album
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClientGalleries;
