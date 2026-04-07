import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, Search, X, Eye, EyeOff, Package,
  GripVertical, Check, LayoutGrid, Rows, Star, Info, Save, Layers
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminProductCollections = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Layout State
  
  // Modals & Forms
  const [showModal, setShowModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayStyle: "grid",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/product-collections/admin/get-collections`,
        { withCredentials: true }
      );
      setCollections(response.data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Failed to load collections");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/shop/admin/get-products`,
        { withCredentials: true }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  // ---------------- COLLECTION FORM LOGIC ----------------
  const resetForm = () => {
    setFormData({ name: "", description: "", displayStyle: "grid" });
    setEditingCollection(null);
  };

  const handleOpenModal = (collection = null, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.name || "",
        description: collection.description || "",
        displayStyle: collection.displayStyle || "grid",
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
    if (!formData.name.trim()) return toast.error("Collection name is required");

    try {
      setIsSubmitting(true);

      if (editingCollection) {
        const response = await axios.put(
          `${import.meta.env.VITE_NODE_URL}/api/product-collections/update/${editingCollection._id}`,
          formData,
          { withCredentials: true }
        );
        setCollections((prev) =>
          prev.map((c) => (c._id === editingCollection._id ? response.data.collection : c))
        );
        toast.success("Collection updated successfully");
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_NODE_URL}/api/product-collections/create`,
          formData,
          { withCredentials: true }
        );
        setCollections((prev) => [...prev, response.data.collection]);
        toast.success("Collection created successfully");
      }

      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!window.confirm("Permanently delete this collection? Products will remain in your inventory.")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/product-collections/delete/${id}`,
        { withCredentials: true }
      );
      setCollections((prev) => prev.filter((c) => c._id !== id));
      toast.success("Collection removed");
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  const handleToggleActive = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_NODE_URL}/api/product-collections/toggle-active/${id}`,
        {},
        { withCredentials: true }
      );
      setCollections((prev) =>
        prev.map((c) => (c._id === id ? response.data.collection : c))
      );
      toast.success("Visibility updated");
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  // ---------------- PRODUCT CURATION LOGIC ----------------
  const handleOpenProductsModal = (collection, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedCollection(collection);
    // Safely extract IDs whether populated or not
    const productIds = collection.products.map((p) => typeof p === 'object' ? p._id : p);
    setSelectedProducts(productIds);
    setShowProductsModal(true);
  };

  const handleCloseProductsModal = () => {
    setShowProductsModal(false);
    setSelectedCollection(null);
    setSelectedProducts([]);
    setSearchQuery("");
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveProducts = async () => {
    if (!selectedCollection) return;

    try {
      setIsSubmitting(true);
      const response = await axios.put(
        `${import.meta.env.VITE_NODE_URL}/api/product-collections/update/${selectedCollection._id}`,
        { products: selectedProducts },
        { withCredentials: true }
      );
      setCollections((prev) =>
        prev.map((c) => (c._id === selectedCollection._id ? response.data.collection : c))
      );
      toast.success("Inventory linked successfully");
      handleCloseProductsModal();
    } catch (error) {
      toast.error("Failed to update products");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProduct = async (collectionId, productId, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_NODE_URL}/api/product-collections/remove-product/${collectionId}/${productId}`,
        { withCredentials: true }
      );
      setCollections((prev) =>
        prev.map((c) => (c._id === collectionId ? response.data.collection : c))
      );
      toast.success("Product unlinked from collection");
    } catch (error) {
      toast.error("Failed to unlink product");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const displayStyleIcons = {
    grid: <LayoutGrid size={14} />,
    carousel: <Rows size={14} />,
    featured: <Star size={14} />,
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter overflow-x-hidden">
      {/* Mobile-Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Package className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Store Collections</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Curate product groups</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleOpenModal(null, e)}
                className="w-full md:w-auto px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={16} /> New Collection
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-amber-800 font-bold text-sm mb-1">Visual Hierarchy Tip</h4>
                <p className="text-amber-700/80 text-xs leading-relaxed">
                  Active collections appear at the top of your shop page before the main inventory list. Create thematic groups like "Bestsellers" or "New Arrivals" to guide your clients.
                </p>
              </div>
            </div>

            {/* Collections List */}
            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : collections.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-charcoal-black/5">
                <div className="w-20 h-20 bg-warm-ivory/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layers size={32} className="text-slate-gray/30" />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-charcoal-black mb-2">No Collections Active</h3>
                <p className="text-slate-gray text-sm mb-8 max-w-md mx-auto">Group your best products together to create visually stunning shop sections.</p>
                <button
                  onClick={(e) => handleOpenModal(null, e)}
                  className="px-6 py-3 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg"
                >
                  Create First Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {collections.map((collection) => (
                  <motion.div
                    key={collection._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-[2rem] shadow-sm border transition-all ${
                      collection.isActive ? "border-charcoal-black/5 hover:border-gold-accent/30" : "border-charcoal-black/5 opacity-60 grayscale"
                    }`}
                  >
                    {/* Collection Header Row */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-charcoal-black/5">
                      <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                        <div className="p-3 bg-warm-ivory/50 rounded-xl cursor-grab hover:bg-warm-ivory transition-colors shrink-0 hidden sm:block">
                          <GripVertical size={20} className="text-slate-gray" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-black">{collection.name}</h3>
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${collection.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-charcoal-black/5 text-slate-gray"}`}>
                              {collection.isActive ? "Visible" : "Hidden"}
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5">
                              {displayStyleIcons[collection.displayStyle]} {collection.displayStyle}
                            </span>
                          </div>
                          {collection.description && <p className="text-slate-gray text-xs md:text-sm line-clamp-1 mt-1 max-w-2xl">{collection.description}</p>}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={(e) => handleOpenProductsModal(collection, e)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-warm-ivory/50 text-charcoal-black hover:bg-gold-accent hover:text-white rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                          <Plus size={14} /> Link Products
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleActive(collection._id, e)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            collection.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title={collection.isActive ? "Hide Collection" : "Show Collection"}
                        >
                          {collection.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button type="button" onClick={(e) => handleOpenModal(collection, e)} className="w-10 h-10 rounded-xl bg-charcoal-black/5 text-charcoal-black hover:bg-charcoal-black hover:text-gold-accent transition-colors flex items-center justify-center">
                          <Edit2 size={14} />
                        </button>
                        <button type="button" onClick={(e) => handleDelete(collection._id, e)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Linked Products Grid */}
                    <div className="p-6 md:p-8 bg-warm-ivory/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">Linked Inventory ({collection.products.length})</span>
                      </div>
                      
                      {collection.products.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {collection.products.map((product) => (
                            <div key={product._id} className="flex items-center gap-3 bg-white pl-2 pr-3 py-2 rounded-xl border border-charcoal-black/10 shadow-sm group hover:border-gold-accent/50 transition-colors">
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-warm-ivory shrink-0">
                                {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex flex-col max-w-[140px]">
                                <span className="text-[11px] font-bold text-charcoal-black truncate">{product.name}</span>
                                <span className="text-[9px] uppercase tracking-widest text-slate-gray truncate">{product.category?.name || "Product"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveProduct(collection._id, product._id, e)}
                                className="w-6 h-6 rounded-full bg-warm-ivory flex items-center justify-center text-slate-gray hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-5 rounded-xl border-2 border-dashed border-charcoal-black/10 bg-white text-center flex flex-col items-center justify-center text-sm text-slate-gray/60">
                          <Package size={24} className="mb-2 text-slate-gray/30" />
                          <span>Collection is empty. Click "Link Products" to curate.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---------------- CREATE/EDIT COLLECTION MODAL ---------------- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">{editingCollection ? "Edit Configuration" : "New Collection"}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Define layout behavior</p>
                </div>
                <button type="button" onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Collection Title <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Wedding Bestsellers" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Short Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional context..." rows={3} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Presentation Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "grid", label: "Grid", icon: LayoutGrid },
                      { value: "carousel", label: "Swipe", icon: Rows },
                      { value: "featured", label: "Hero", icon: Star },
                    ].map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, displayStyle: style.value })}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                          formData.displayStyle === style.value ? "border-gold-accent bg-gold-accent/5 text-gold-accent shadow-sm" : "border-charcoal-black/10 text-slate-gray hover:bg-warm-ivory"
                        }`}
                      >
                        <style.icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors">Cancel</button>
                <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />}
                  {isSubmitting ? "Processing..." : "Save Configuration"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- CURATION MODAL ---------------- */}
      <AnimatePresence>
        {showProductsModal && selectedCollection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseProductsModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden">
              
              {/* Curation Header & Search */}
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-charcoal-black">Curate Items</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold-accent mt-1">Target: {selectedCollection.name}</p>
                  </div>
                  <button type="button" onClick={handleCloseProductsModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
                </div>
                
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by product name or category..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black shadow-sm"
                  />
                </div>
              </div>

              {/* Product List Grid */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.includes(product._id);
                    return (
                      <div
                        key={product._id}
                        onClick={() => toggleProductSelection(product._id)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          isSelected ? "border-gold-accent bg-gold-accent/5 shadow-sm" : "border-transparent bg-warm-ivory/20 hover:bg-warm-ivory/50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all shrink-0 ${isSelected ? "bg-gold-accent" : "border border-charcoal-black/20 bg-white"}`}>
                          {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-charcoal-black/5">
                          {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-charcoal-black truncate">{product.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-slate-gray truncate mt-0.5">{product.category?.name || "Product"}</p>
                        </div>
                      </div>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-10 text-center text-slate-gray">
                      No products match your search.
                    </div>
                  )}
                </div>
              </div>

              {/* Curation Footer */}
              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">
                  <strong className="text-charcoal-black">{selectedProducts.length}</strong> Selected
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={handleCloseProductsModal} className="px-5 py-3 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors">Cancel</button>
                  <button type="button" onClick={handleSaveProducts} disabled={isSubmitting} className="px-8 py-3 bg-charcoal-black text-gold-accent rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} 
                    {isSubmitting ? "Linking..." : "Confirm Selection"}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminProductCollections;