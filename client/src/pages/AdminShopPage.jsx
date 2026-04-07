import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, Search, X, Star, StarOff,
  Eye, EyeOff, FolderPlus, Layers, Image as ImageIcon,
  Save, Upload, ShoppingBag
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile layout state
  
  // View & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("products"); // "products" or "categories"

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form state for products
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", category: "", popularity: "",
    isBestseller: false, oldPrice: "", tag: "",
  });
 const [mediaFiles, setMediaFiles] = useState([]);
const [mediaPreview, setMediaPreview] = useState([]);

  // Form state for categories
  const [categoryFormData, setCategoryFormData] = useState({
    name: "", description: "", order: "",
  });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);

  // Data Fetching
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/product-categories/admin/get-categories`,
        { withCredentials: true }
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_URL}/api/shop/admin/get-products`,
        { withCredentials: true }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ---------------- PRODUCT HANDLERS ----------------
  const resetForm = () => {
    setFormData({
      name: "", description: "", price: "", category: categories.length > 0 ? categories[0]._id : "",
      popularity: "", isBestseller: false, oldPrice: "", tag: "",
    });
    setMediaFiles([]);
setMediaPreview([]);
 setEditingProduct(null);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, description: product.description, price: product.price.toString(),
        category: product.category?._id || product.category, popularity: product.popularity?.toString() || "",
        isBestseller: product.isBestseller || false, oldPrice: product.oldPrice ? product.oldPrice.toString() : "",
        tag: product.tag || "none",
      });
    setMediaPreview(product.media || []);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

const handleMediaChange = (e) => {
  const files = Array.from(e.target.files);

  setMediaFiles(files);

  const previews = files.map((file) => URL.createObjectURL(file));
  setMediaPreview(previews);
};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingProduct && mediaFiles.length === 0) return toast.error("Product media is required");
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      return toast.error("Please fill all required fields");
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("oldPrice", formData.oldPrice || "");
      data.append("tag", formData.tag === "none" ? "" : formData.tag);
      data.append("category", formData.category);
      data.append("popularity", formData.popularity || "0");
      data.append("isBestseller", formData.isBestseller);
     mediaFiles.forEach((file) => {
  data.append("media", file);
});

      if (editingProduct) {
        await axios.put(`${import.meta.env.VITE_NODE_URL}/api/shop/update-product/${editingProduct._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Product updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_NODE_URL}/api/shop/add-product`, data, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Product added successfully");
      }

      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/shop/delete-product/${id}`, { withCredentials: true });
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleBestseller = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await axios.patch(`${import.meta.env.VITE_NODE_URL}/api/shop/toggle-bestseller/${id}`, {}, { withCredentials: true });
      toast.success(response.data.message);
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isBestseller: !p.isBestseller } : p));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleActive = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await axios.patch(`${import.meta.env.VITE_NODE_URL}/api/shop/toggle-active/${id}`, {}, { withCredentials: true });
      toast.success(response.data.message);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: !p.isActive } : p)));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ---------------- CATEGORY HANDLERS ----------------
  const resetCategoryForm = () => {
    setCategoryFormData({ name: "", description: "", order: "" });
    setCategoryImageFile(null); setCategoryImagePreview(null); setEditingCategory(null);
  };

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({ name: category.name, description: category.description || "", order: category.order?.toString() || "" });
      setCategoryImagePreview(category.image);
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    resetCategoryForm();
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImageFile(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name) return toast.error("Category name is required");

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("name", categoryFormData.name);
      data.append("description", categoryFormData.description);
      data.append("order", categoryFormData.order || "0");
      if (categoryImageFile) data.append("image", categoryImageFile);

      if (editingCategory) {
        await axios.put(`${import.meta.env.VITE_NODE_URL}/api/product-categories/update-category/${editingCategory._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Category updated");
      } else {
        await axios.post(`${import.meta.env.VITE_NODE_URL}/api/product-categories/add-category`, data, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Category created");
      }

      handleCloseCategoryModal();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete category? Products in this category will be affected.")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/product-categories/delete-category/${id}`, { withCredentials: true });
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleToggleCategoryStatus = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await axios.patch(`${import.meta.env.VITE_NODE_URL}/api/product-categories/toggle-status/${id}`, {}, { withCredentials: true });
      toast.success(response.data.message);
      setCategories((prev) => prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c)));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ---------------- VIEW LOGIC ----------------
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || product.category?._id === categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const getCategoryName = (product) => {
    if (product.category?.name) return product.category.name;
    const cat = categories.find((c) => c._id === product.category);
    return cat?.name || "Uncategorized";
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <ShoppingBag className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Store Management</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage physical & digital inventory</p>
                </div>
              </div>
              <div className="flex w-full md:w-auto gap-3">
                <button
                  onClick={() => handleOpenCategoryModal(null)}
                  className="flex-1 md:flex-none px-5 py-3.5 bg-white border border-charcoal-black/10 text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <FolderPlus size={16} /> Category
                </button>
                <button
                  onClick={() => handleOpenModal(null)}
                  className="flex-1 md:flex-none px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> New Product
                </button>
              </div>
            </div>

            {/* Premium Tab Selector */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setActiveTab("products")}
                className={`px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === "products" ? "bg-charcoal-black text-gold-accent shadow-lg" : "bg-white border border-charcoal-black/5 text-slate-gray hover:bg-warm-ivory"
                }`}
              >
                <Layers size={16} /> Products Directory ({products.length})
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === "categories" ? "bg-charcoal-black text-gold-accent shadow-lg" : "bg-white border border-charcoal-black/5 text-slate-gray hover:bg-warm-ivory"
                }`}
              >
                <FolderPlus size={16} /> Categories ({categories.length})
              </button>
            </div>

            {/* ---------- PRODUCTS TAB ---------- */}
            {activeTab === "products" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Search and Filter */}
                <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-charcoal-black/5 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" size={18} />
                    <input
                      type="text"
                      placeholder="Search inventory by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full md:w-64 px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm font-bold text-charcoal-black outline-none focus:ring-1 focus:ring-gold-accent cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Products Grid - FIX: grid-cols-2 on mobile */}
                {isLoading ? (
                  <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    <AnimatePresence>
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product._id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`bg-white rounded-[1rem] md:rounded-[2rem] overflow-hidden shadow-sm border transition-all flex flex-col ${
                            product.isActive ? "border-charcoal-black/5 hover:shadow-md" : "border-charcoal-black/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                          }`}
                        >
                          <div className="relative aspect-[4/5] bg-warm-ivory overflow-hidden group">
                            <img src={product.media?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            
                            {/* Badges - Scaled for mobile */}
                            <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 md:gap-2">
                              {product.isBestseller && (
                                <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg shadow-sm">
                                  Bestseller
                                </span>
                              )}
                              {!product.isActive && (
                                <span className="bg-red-500/90 backdrop-blur-md text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg shadow-sm flex items-center gap-1">
                                  <EyeOff size={10} /> Hidden
                                </span>
                              )}
                            </div>

                            {/* Hover Actions - Scaled for mobile touch targets */}
                            <div className="absolute inset-0 bg-charcoal-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-3 backdrop-blur-[2px]">
                              <button onClick={(e) => handleToggleActive(product._id, e)} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors border ${product.isActive ? 'bg-white/10 border-white/20 text-white hover:bg-amber-500 hover:border-amber-500' : 'bg-emerald-500 border-emerald-500 text-white'}`} title={product.isActive ? "Hide Product" : "Publish Product"}>
                                {product.isActive ? <EyeOff size={14} className="md:w-4 md:h-4"/> : <Eye size={14} className="md:w-4 md:h-4"/>}
                              </button>
                              <button onClick={() => handleOpenModal(product)} className="w-8 h-8 md:w-10 md:h-10 bg-white/10 border border-white/20 text-white hover:bg-gold-accent hover:border-gold-accent rounded-full flex items-center justify-center transition-colors" title="Edit">
                                <Edit2 size={14} className="md:w-4 md:h-4"/>
                              </button>
                              <button onClick={(e) => handleDelete(product._id, e)} className="w-8 h-8 md:w-10 md:h-10 bg-white/10 border border-white/20 text-white hover:bg-red-500 hover:border-red-500 rounded-full flex items-center justify-center transition-colors" title="Delete">
                                <Trash2 size={14} className="md:w-4 md:h-4"/>
                              </button>
                            </div>
                          </div>

                          <div className="p-3 md:p-6 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-gray truncate mr-2">{getCategoryName(product)}</span>
                              <button onClick={(e) => handleToggleBestseller(product._id, e)} className={`p-1 md:p-1.5 rounded-lg transition-colors ${product.isBestseller ? "text-amber-500 bg-amber-50" : "text-slate-gray hover:text-amber-500 hover:bg-amber-50"}`} title="Toggle Bestseller">
                                {product.isBestseller ? <Star size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" /> : <StarOff size={12} className="md:w-3.5 md:h-3.5" />}
                              </button>
                            </div>
                            <h3 className="font-playfair text-sm md:text-lg font-bold text-charcoal-black mb-1 line-clamp-1 leading-tight">{product.name}</h3>
                            <p className="text-[10px] md:text-xs text-slate-gray line-clamp-1 md:line-clamp-2 mb-3 md:mb-4 flex-1 leading-relaxed">{product.description}</p>
                            
                            <div className="flex items-center justify-between pt-2.5 md:pt-4 border-t border-charcoal-black/5 mt-auto">
                              <div className="flex items-baseline gap-1.5 md:gap-2">
                                <span className="text-sm md:text-lg font-black text-charcoal-black">₹{product.price.toLocaleString()}</span>
                                {product.oldPrice && <span className="text-[10px] md:text-xs text-slate-gray/50 line-through hidden sm:inline">₹{product.oldPrice.toLocaleString()}</span>}
                              </div>
                              {product.tag && product.tag !== "none" && (
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-gold-accent/10 text-gold-accent px-1.5 py-0.5 md:px-2 md:py-1 rounded-md">{product.tag}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredProducts.length === 0 && (
                      <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                        <ShoppingBag className="mx-auto text-slate-gray/20 mb-4" size={48} />
                        <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">No products found</h3>
                        <p className="text-slate-gray text-sm mb-4">Try adjusting your search or add a new item.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------- CATEGORIES TAB ---------- */}
            {activeTab === "categories" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                <AnimatePresence>
                  {categories.map((category) => (
                    <motion.div
                      key={category._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`bg-white rounded-[1rem] md:rounded-[2rem] overflow-hidden shadow-sm border border-charcoal-black/5 flex flex-col transition-all group ${!category.isActive ? "opacity-60 grayscale" : "hover:shadow-md"}`}
                    >
                      <div className="h-24 md:h-32 relative bg-warm-ivory/50 flex items-center justify-center overflow-hidden">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <FolderPlus size={32} className="md:w-10 md:h-10 text-gold-accent/30" />
                        )}
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex gap-2">
                          <span className={`px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-md ${category.isActive ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                            {category.isActive ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 md:p-6 flex flex-col flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
                           <h3 className="font-playfair text-sm md:text-xl font-bold text-charcoal-black truncate">{category.name}</h3>
                           <span className="text-[8px] md:text-[10px] font-bold text-slate-gray bg-charcoal-black/5 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md w-fit">Order: {category.order || 0}</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-gray line-clamp-2 mb-4 md:mb-6 flex-1 leading-relaxed">{category.description || "No description provided."}</p>
                        
                        <div className="flex gap-1.5 md:gap-2 pt-3 md:pt-4 border-t border-charcoal-black/5 mt-auto">
                          <button onClick={(e) => handleToggleCategoryStatus(category._id, e)} className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 md:px-3 md:py-2.5 rounded-lg md:rounded-xl transition-colors text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${category.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                            {category.isActive ? <><EyeOff size={12} className="md:w-[14px] md:h-[14px]" /> Hide</> : <><Eye size={12} className="md:w-[14px] md:h-[14px]" /> Show</>}
                          </button>
                          <button onClick={() => handleOpenCategoryModal(category)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-warm-ivory/50 text-charcoal-black hover:bg-gold-accent hover:text-white transition-colors flex items-center justify-center shadow-sm shrink-0">
                            <Edit2 size={12} className="md:w-[14px] md:h-[14px]" />
                          </button>
                          <button onClick={(e) => handleDeleteCategory(category._id, e)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shadow-sm shrink-0">
                            <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {categories.length === 0 && (
                  <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                    <FolderPlus className="mx-auto text-slate-gray/30 mb-4" size={48} />
                    <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">No categories exist</h3>
                    <p className="text-slate-gray text-sm mb-4">Group your products by creating a category.</p>
                    <button onClick={() => handleOpenCategoryModal(null)} className="text-[11px] font-bold uppercase tracking-widest text-gold-accent hover:text-charcoal-black transition-colors">
                      + Create Category
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* ---------------- PRODUCT MODAL (z-[100]) ---------------- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">{editingProduct ? "Edit Product" : "New Product"}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Inventory Management</p>
                </div>
                <button type="button" onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Product Image {!editingProduct && <span className="text-red-500">*</span>}</label>
                  <div className="flex items-center gap-4 md:gap-6">
                   {mediaPreview.length > 0 && (
  <div className="flex gap-3 flex-wrap">
    {mediaPreview.map((file, index) => (
      <div
        key={index}
        className="w-24 h-24 md:w-28 md:h-32 rounded-xl overflow-hidden border border-charcoal-black/5"
      >
        {file.includes(".mp4") || file.includes(".webm") ? (
          <video src={file} className="w-full h-full object-cover" />
        ) : (
          <img src={file} className="w-full h-full object-cover" />
        )}
      </div>
    ))}
  </div>
)}
                    <label className={`flex-1 border-2 border-dashed rounded-xl p-4 md:p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-24 md:h-32 ${mediaPreview ? 'border-charcoal-black/10 hover:border-gold-accent hover:bg-warm-ivory/20' : 'border-gold-accent/30 bg-gold-accent/5 hover:border-gold-accent'}`}>
                      <Upload size={20} className="text-gold-accent mb-2 md:w-6 md:h-6" />
                      <span className="text-xs md:text-sm font-bold text-charcoal-black">{mediaFiles ? "Change Image" : "Upload Image"}</span>
                      <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1 text-center">JPG, PNG (Max 10MB)</span>
                      <input
  type="file"
  accept="image/*,video/*"
  multiple
  onChange={handleMediaChange}
  className="hidden"
/>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Product Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Leather Bound Album" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Category <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black cursor-pointer">
                      <option value="">Select Category</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Description <span className="text-red-500">*</span></label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} placeholder="Detailed product description..." className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Price <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" placeholder="₹" className="w-full px-4 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Old Price</label>
                    <input type="number" name="oldPrice" value={formData.oldPrice} onChange={handleInputChange} min="0" placeholder="₹" className="w-full px-4 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Promo Tag</label>
                    <select name="tag" value={formData.tag} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black cursor-pointer">
                      <option value="none">None</option>
                      <option value="new">New</option>
                      <option value="sale">Sale</option>
                      <option value="popular">Popular</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Pop Score</label>
                    <input type="number" name="popularity" value={formData.popularity} onChange={handleInputChange} min="0" max="100" placeholder="0-100" className="w-full px-4 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 md:p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Featured Bestseller</h4>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-amber-700/70 mt-1">Highlights product across the shop</p>
                  </div>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, isBestseller: !prev.isBestseller }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${formData.isBestseller ? "bg-amber-500" : "bg-charcoal-black/20"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isBestseller ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </form>

              <div className="p-4 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="px-5 md:px-6 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors">Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} 
                  {isSubmitting ? "Saving..." : editingProduct ? "Update" : "Publish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- CATEGORY MODAL (z-[100]) ---------------- */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseCategoryModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 flex flex-col overflow-hidden max-h-[90vh]">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">{editingCategory ? "Edit Category" : "New Category"}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Structure inventory</p>
                </div>
                <button type="button" onClick={handleCloseCategoryModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleCategorySubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Category Image (Optional)</label>
                  <div className={`relative w-full aspect-[21/9] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all ${categoryImagePreview ? 'border-gold-accent bg-gold-accent/5' : 'border-charcoal-black/10 bg-warm-ivory/20 hover:border-gold-accent'}`} onClick={() => document.getElementById("cat-upload").click()}>
                     {categoryImagePreview ? (
                       <>
                         <img src={categoryImagePreview} alt="Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                           <span className="px-4 py-2 bg-white text-charcoal-black rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg">Replace Image</span>
                         </div>
                       </>
                     ) : (
                       <>
                         <ImageIcon className="text-gold-accent mb-2 md:mb-3 md:w-7 md:h-7 w-5 h-5" />
                         <span className="text-xs md:text-sm font-bold text-charcoal-black">Upload Background</span>
                       </>
                     )}
                     <input id="cat-upload" type="file" accept="image/*" onChange={handleCategoryImageChange} className="hidden" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Category Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={categoryFormData.name} onChange={handleCategoryInputChange} required placeholder="e.g. Albums" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Sort Order</label>
                    <input type="number" name="order" value={categoryFormData.order} onChange={handleCategoryInputChange} placeholder="0" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Description (Optional)</label>
                  <textarea name="description" value={categoryFormData.description} onChange={handleCategoryInputChange} rows={3} placeholder="Describe this category..." className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>
              </form>

              <div className="p-4 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={handleCloseCategoryModal} className="px-5 md:px-6 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors">Cancel</button>
                <button onClick={handleCategorySubmit} disabled={isSubmitting} className="flex-1 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} 
                  {isSubmitting ? "Saving..." : editingCategory ? "Update" : "Publish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminShopPage;