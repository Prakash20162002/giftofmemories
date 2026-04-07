import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp, X,
  Image as ImageIcon, Package as PackageIcon, Save, Layers,
  Eye, EyeOff, LayoutGrid, Rows, Star, Upload
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopBar from "../components/admin/TopBar";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminServicePage = () => {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [expandedPackages, setExpandedPackages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const [selectedPackageForService, setSelectedPackageForService] = useState(null);

  // Form states (Safely initialized to empty strings)
  const [packageForm, setPackageForm] = useState({
    title: "", description: "", startingPrice: "", order: "", isMostBooked: false,
  });

  const [serviceForm, setServiceForm] = useState({
    title: "", category: "Weddings", shortDescription: "", description: "",
    price: "", duration: "", deliverables: "", location: "", packageId: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [packageImageFile, setPackageImageFile] = useState(null);
  const [packageImagePreview, setPackageImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ["Weddings", "Portraits", "Events", "Commercial"];

  const displayStyleIcons = {
    grid: <LayoutGrid size={14} />,
    carousel: <Rows size={14} />,
    featured: <Star size={14} />,
  };

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/services/packages`, { withCredentials: true });
      setPackages(res.data || []);
      
      // Auto-expand packages on load for better UX
      const initialExpandedState = {};
      (res.data || []).forEach(pkg => { initialExpandedState[pkg._id] = true; });
      setExpandedPackages(initialExpandedState);
    } catch (error) {
      toast.error("Failed to load packages");
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/services/services`);
      setServices(response.data || []);
    } catch (error) {
      toast.error("Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPackages();
  }, []);

  // ---------------- PACKAGE HANDLERS ----------------
  const openAddPackageModal = () => {
    setCurrentPackage(null);
    setPackageForm({ title: "", description: "", startingPrice: "", order: "", isMostBooked: false });
    setPackageImageFile(null); setPackageImagePreview(null);
    setShowPackageModal(true);
  };

  const openEditPackageModal = (pkg, e) => {
    if (e) e.stopPropagation();
    setCurrentPackage(pkg);
    setPackageForm({
      title: pkg.title || "",
      description: pkg.description || "",
      startingPrice: pkg.startingPrice?.toString() || "",
      order: pkg.order?.toString() || "",
      isMostBooked: pkg.isMostBooked || false,
    });
    setPackageImageFile(null);
    setPackageImagePreview(pkg.image || null);
    setShowPackageModal(true);
  };

  const closePackageModal = () => {
    setShowPackageModal(false);
    setCurrentPackage(null);
  };

  const handlePackageInputChange = (e) => {
    const { name, value } = e.target;
    setPackageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePackageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPackageImageFile(file);
      setPackageImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPackage = async (e) => {
    e.preventDefault();
    if (!packageForm.title.trim()) return toast.error("Package title is required");
    
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("title", packageForm.title);
      formData.append("description", packageForm.description);
      if (packageForm.startingPrice) formData.append("startingPrice", packageForm.startingPrice);
      if (packageForm.order) formData.append("order", packageForm.order);
      formData.append("isMostBooked", packageForm.isMostBooked);
      if (packageImageFile) formData.append("image", packageImageFile);

      if (currentPackage) {
        await axios.put(`${import.meta.env.VITE_NODE_URL}/api/services/packages/${currentPackage._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Package updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_NODE_URL}/api/services/packages`, formData, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Package created successfully");
      }
      closePackageModal();
      await fetchPackages();
    } catch (error) {
      toast.error("Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this package? Associated services will remain but become unassigned.")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/services/packages/${id}`, { withCredentials: true });
      toast.success("Package deleted successfully");
      await fetchPackages();
      await fetchServices();
    } catch (error) {
      toast.error("Failed to delete package");
    }
  };

  // ---------------- SERVICE HANDLERS ----------------
  const openAddServiceModal = (packageId = null, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Safety check to ensure event object isn't passed as packageId
    const safePackageId = (typeof packageId === 'string') ? packageId : "";

    setCurrentService(null);
    setSelectedPackageForService(safePackageId);
    setServiceForm({
      title: "", category: "Weddings", shortDescription: "", description: "",
      price: "", duration: "", deliverables: "", location: "", packageId: safePackageId,
    });
    setImageFile(null); setImagePreview(null);
    setLogoFile(null); setLogoPreview(null);
    setShowServiceModal(true);
  };

  const openEditServiceModal = (service, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    setCurrentService(service);
    setSelectedPackageForService(service.package || "");
    
    // Using || "" fallbacks prevents React from crashing on null values
    setServiceForm({
      title: service.title || "", 
      category: service.category || "Weddings", 
      shortDescription: service.shortDescription || "", 
      description: service.description || "", 
      price: service.price || "", 
      duration: service.details?.duration || "", 
      deliverables: service.details?.deliverables || "", 
      location: service.details?.location || "", 
      packageId: service.package || "",
    });
    
    setImagePreview(service.images && service.images.length > 0 ? service.images[0] : null);
    setImageFile(null);
    setLogoPreview(service.logo || null);
    setLogoFile(null);
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setCurrentService(null);
    setSelectedPackageForService(null);
  };

  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) return toast.error("Service Title is required");

    try {
      setIsSaving(true);
      const data = new FormData();
      data.append("title", serviceForm.title);
      data.append("category", serviceForm.category);
      data.append("shortDescription", serviceForm.shortDescription);
      data.append("description", serviceForm.description);
      data.append("price", serviceForm.price);

      const details = {
        duration: serviceForm.duration,
        deliverables: serviceForm.deliverables,
        location: serviceForm.location,
      };
      data.append("details", JSON.stringify(details));
      data.append("packageId", serviceForm.packageId || "");

      if (imageFile) data.append("images", imageFile);
      if (logoFile) data.append("logo", logoFile);

      if (currentService) {
        await axios.put(`${import.meta.env.VITE_NODE_URL}/api/services/update-service/${currentService._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Service updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_NODE_URL}/api/services/add-service`, data, {
          headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        toast.success("Service created successfully");
      }

      closeServiceModal();
      await fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_NODE_URL}/api/services/delete-service/${id}`, { withCredentials: true });
      toast.success("Service deleted successfully");
      await fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const togglePackageExpand = (packageId) => {
    setExpandedPackages((prev) => ({ ...prev, [packageId]: !prev[packageId] }));
  };

  const getServicesForPackage = (packageId) => services.filter((s) => s.package === packageId);
  const getUnassignedServices = () => services.filter((s) => !s.package);
  const filteredPackages = packages.filter((pkg) => pkg.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-warm-ivory/20 font-inter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-charcoal-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Layers className="text-gold-accent" size={24} />
                </div>
                <div>
                  <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">Services Architecture</h1>
                  <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mt-1">Manage packages and offerings</p>
                </div>
              </div>
              <div className="flex w-full lg:w-auto gap-3">
                <button
                  onClick={() => openAddServiceModal(null)}
                  className="flex-1 lg:flex-none px-6 py-3.5 bg-white border border-charcoal-black/10 text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Standalone Service
                </button>
                <button
                  onClick={openAddPackageModal}
                  className="flex-1 lg:flex-none px-6 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> New Package
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" size={18} />
              <input
                type="text"
                placeholder="Search specific packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black shadow-sm"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-32"><Loader color="#C9A24D" /></div>
            ) : (
              <div className="space-y-6">
                
                {/* PACKAGES LIST */}
                {filteredPackages.map((pkg) => {
                  const pkgServices = getServicesForPackage(pkg._id);
                  const isExpanded = expandedPackages[pkg._id];

                  return (
                    <motion.div
                      key={pkg._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden transition-all hover:shadow-md"
                    >
                      {/* Package Header Row */}
                      <div 
                        className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-warm-ivory/30 transition-colors"
                        onClick={() => togglePackageExpand(pkg._id)}
                      >
                        <div className="flex items-center gap-5 flex-1">
                          {pkg.image ? (
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-gold-accent/20 shrink-0 shadow-sm">
                              <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-warm-ivory rounded-2xl flex items-center justify-center shrink-0 border border-charcoal-black/5">
                              <PackageIcon className="text-gold-accent" size={28} />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h3 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-black uppercase tracking-wide">
                                {pkg.title}
                              </h3>
                              {pkg.isMostBooked && (
                                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 rounded-lg border border-amber-200 shadow-sm">
                                  🔥 Most Booked
                                </span>
                              )}
                            </div>
                            {pkg.description && (
                              <p className="text-slate-gray text-xs md:text-sm line-clamp-1 max-w-2xl mt-1">
                                {pkg.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              {pkg.startingPrice && (
                                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                  Starts at ₹{pkg.startingPrice}
                                </span>
                              )}
                              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-gray border border-charcoal-black/10 px-3 py-1.5 rounded-lg bg-white">
                                {pkgServices.length} Sub-Services
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons with Stop Propagation */}
                        <div className="flex items-center gap-2 border-t border-charcoal-black/5 pt-4 md:pt-0 md:border-0">
                          <button
                            onClick={(e) => openAddServiceModal(pkg._id, e)}
                            className="flex-1 md:flex-none px-5 py-2.5 bg-charcoal-black text-gold-accent rounded-xl hover:bg-gold-accent hover:text-charcoal-black transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md"
                          >
                            <Plus size={14} /> Add Service
                          </button>
                          <button
                            onClick={(e) => openEditPackageModal(pkg, e)}
                            className="w-10 h-10 rounded-xl bg-warm-ivory/50 text-charcoal-black hover:bg-gold-accent hover:text-white transition-colors flex items-center justify-center shadow-sm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDeletePackage(pkg._id, e)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="w-10 h-10 rounded-xl bg-white border border-charcoal-black/10 text-charcoal-black flex items-center justify-center shadow-sm ml-2">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Sub-Services */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-charcoal-black/5 bg-warm-ivory/30"
                          >
                            <div className="p-6 md:p-8">
                              {pkgServices.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-charcoal-black/10">
                                  <p className="text-sm font-bold text-charcoal-black mb-2">No services assigned</p>
                                  <button
                                    onClick={(e) => openAddServiceModal(pkg._id, e)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-gold-accent hover:text-charcoal-black transition-colors"
                                  >
                                    + Create First Service
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                  {pkgServices.map((service) => (
                                    <div key={service._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-charcoal-black/5 hover:border-gold-accent/40 transition-all group flex flex-col">
                                      <div className="h-40 overflow-hidden relative bg-warm-ivory">
                                        {service.images && service.images.length > 0 && (
                                          <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-charcoal-black shadow-sm">
                                          {service.category}
                                        </div>
                                      </div>
                                      <div className="p-5 flex flex-col flex-1">
                                        <h4 className="font-playfair text-lg font-bold text-charcoal-black mb-1 line-clamp-1">{service.title}</h4>
                                        <p className="text-slate-gray text-xs mb-4 line-clamp-2 leading-relaxed flex-1">{service.shortDescription || service.description}</p>
                                        <div className="flex gap-2 pt-4 border-t border-charcoal-black/5 mt-auto">
                                          <button onClick={(e) => openEditServiceModal(service, e)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-warm-ivory/50 text-charcoal-black hover:bg-gold-accent hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                                            <Edit2 size={14} /> Edit Data
                                          </button>
                                          <button onClick={(e) => handleDeleteService(service._id, e)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0">
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* UNASSIGNED SERVICES SECTION */}
                {getUnassignedServices().length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden mt-8">
                    <div className="p-6 md:p-8 border-b border-charcoal-black/5 flex items-center gap-4 bg-warm-ivory/10">
                      <div className="w-12 h-12 bg-charcoal-black/5 rounded-2xl flex items-center justify-center">
                        <PackageIcon className="text-slate-gray" size={24} />
                      </div>
                      <div>
                        <h3 className="font-playfair text-xl font-bold text-charcoal-black">Standalone Services</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Not linked to any package</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 bg-warm-ivory/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {getUnassignedServices().map((service) => (
                          <div key={service._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-charcoal-black/5 hover:border-gold-accent/40 transition-all group flex flex-col">
                            <div className="h-40 overflow-hidden relative bg-warm-ivory">
                              {service.images && service.images.length > 0 && (
                                <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              )}
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-charcoal-black rounded-lg shadow-sm">
                                {service.category}
                              </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                              <h4 className="font-playfair text-lg font-bold text-charcoal-black mb-1 line-clamp-1">{service.title}</h4>
                              <p className="text-slate-gray text-xs mb-4 line-clamp-2 leading-relaxed flex-1">{service.shortDescription || service.description}</p>
                              <div className="flex gap-2 pt-4 border-t border-charcoal-black/5 mt-auto">
                                <button onClick={(e) => openEditServiceModal(service, e)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-warm-ivory/50 text-charcoal-black hover:bg-gold-accent hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                                  <Edit2 size={14} /> Edit Data
                                </button>
                                <button onClick={(e) => handleDeleteService(service._id, e)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {filteredPackages.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-charcoal-black/10">
                    <PackageIcon className="mx-auto text-slate-gray/30 mb-4" size={48} />
                    <h3 className="text-xl font-playfair font-bold text-charcoal-black mb-1">No packages found</h3>
                    <p className="text-slate-gray text-sm mb-4">Start organizing your services by creating a package.</p>
                    <button onClick={openAddPackageModal} className="text-[11px] font-bold uppercase tracking-widest text-gold-accent hover:text-charcoal-black transition-colors">
                      + Create first package
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---------------- PACKAGE MODAL ---------------- */}
      <AnimatePresence>
        {showPackageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closePackageModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">{currentPackage ? "Edit Package" : "New Package"}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Bundle Configuration</p>
                </div>
                <button type="button" onClick={closePackageModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmitPackage} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Cover Image</label>
                  <div className={`relative w-full aspect-[21/9] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all ${packageImagePreview ? 'border-gold-accent bg-gold-accent/5' : 'border-charcoal-black/10 bg-warm-ivory/20 hover:border-gold-accent'}`} onClick={() => document.getElementById("pkg-upload").click()}>
                     {packageImagePreview ? (
                       <>
                         <img src={packageImagePreview} alt="Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-charcoal-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                           <span className="px-4 py-2 bg-white text-charcoal-black rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg">Replace Cover</span>
                         </div>
                       </>
                     ) : (
                       <>
                         <ImageIcon className="text-gold-accent mb-3" size={28} />
                         <span className="text-sm font-bold text-charcoal-black">Upload Package Cover</span>
                       </>
                     )}
                     <input id="pkg-upload" type="file" accept="image/*" onChange={handlePackageFileChange} className="hidden" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Package Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={packageForm.title} onChange={handlePackageInputChange} required placeholder="e.g. Royal Wedding Bundle" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Description Overview</label>
                  <textarea name="description" value={packageForm.description} onChange={handlePackageInputChange} rows={3} placeholder="A compelling summary..." className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Starting Price (₹)</label>
                    <input type="number" name="startingPrice" value={packageForm.startingPrice} onChange={handlePackageInputChange} placeholder="e.g. 150000" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Display Order</label>
                    <input type="number" name="order" value={packageForm.order} onChange={handlePackageInputChange} placeholder="e.g. 1" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Highlight as "Most Booked"</h4>
                    <p className="text-[10px] uppercase tracking-widest text-amber-700/70 mt-1">Adds a visual badge</p>
                  </div>
                  <button type="button" onClick={() => setPackageForm(prev => ({ ...prev, isMostBooked: !prev.isMostBooked }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${packageForm.isMostBooked ? "bg-amber-500" : "bg-charcoal-black/20"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${packageForm.isMostBooked ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex justify-end gap-3">
                <button type="button" onClick={closePackageModal} className="px-6 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors">Cancel</button>
                <button onClick={handleSubmitPackage} disabled={isSaving} className="px-8 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} 
                  {isSaving ? "Saving..." : "Publish Package"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- SERVICE MODAL (z-[100]) ---------------- */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeServiceModal} className="absolute inset-0 bg-charcoal-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden">
              
              <div className="p-6 md:p-8 border-b border-charcoal-black/5 bg-warm-ivory/30 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-charcoal-black">{currentService ? "Edit Sub-Service" : "Create Sub-Service"}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mt-1">Configure individual offering</p>
                </div>
                <button type="button" onClick={closeServiceModal} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-gray hover:text-red-500 transition-colors shadow-sm"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmitService} className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Image Upload Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Card Image</label>
                    <div className="relative aspect-[4/3] border-2 border-dashed border-charcoal-black/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-gold-accent hover:bg-gold-accent/5 transition-all bg-warm-ivory/20" onClick={() => document.getElementById("svc-img").click()}>
                       {imagePreview ? (
                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <div className="text-center p-4">
                           <Upload className="text-gold-accent mx-auto mb-2" size={24} />
                           <span className="text-xs font-bold text-charcoal-black block">Upload Image</span>
                         </div>
                       )}
                       <input id="svc-img" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Vector Logo / Icon</label>
                    <div className="relative aspect-[4/3] border-2 border-dashed border-charcoal-black/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-gold-accent hover:bg-gold-accent/5 transition-all bg-warm-ivory/20" onClick={() => document.getElementById("svc-logo").click()}>
                       {logoPreview ? (
                         <div className="w-24 h-24 p-2 bg-white rounded-2xl shadow-sm border border-charcoal-black/5">
                           <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                         </div>
                       ) : (
                         <div className="text-center p-4">
                           <ImageIcon className="text-slate-gray/50 mx-auto mb-2" size={24} />
                           <span className="text-xs font-bold text-charcoal-black block">Upload Icon (PNG/SVG)</span>
                         </div>
                       )}
                       <input id="svc-logo" type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Service Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={serviceForm.title} onChange={handleServiceInputChange} required placeholder="e.g. Candid Coverage" className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Genre Category <span className="text-red-500">*</span></label>
                    <select name="category" value={serviceForm.category} onChange={handleServiceInputChange} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black cursor-pointer">
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Package Link</label>
                  <select name="packageId" value={serviceForm.packageId} onChange={handleServiceInputChange} className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black cursor-pointer">
                    <option value="">No Package (Standalone Service)</option>
                    {packages.map((pkg) => <option key={pkg._id} value={pkg._id}>{pkg.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Short Description</label>
                  <input type="text" name="shortDescription" value={serviceForm.shortDescription} onChange={handleServiceInputChange} maxLength={100} placeholder="Brief summary for card view..." className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Full Details <span className="text-red-500">*</span></label>
                  <textarea name="description" value={serviceForm.description} onChange={handleServiceInputChange} required rows={5} placeholder="Comprehensive details..." className="w-full px-5 py-3.5 bg-warm-ivory/30 border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all resize-none text-charcoal-black" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 bg-warm-ivory/20 p-6 rounded-2xl border border-charcoal-black/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Price <span className="text-red-500">*</span></label>
                    <input type="text" name="price" value={serviceForm.price} onChange={handleServiceInputChange} required placeholder="₹45,000" className="w-full px-4 py-3 bg-white border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Duration</label>
                    <input type="text" name="duration" value={serviceForm.duration} onChange={handleServiceInputChange} placeholder="Full Day" className="w-full px-4 py-3 bg-white border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Output</label>
                    <input type="text" name="deliverables" value={serviceForm.deliverables} onChange={handleServiceInputChange} placeholder="500+ Photos" className="w-full px-4 py-3 bg-white border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-black ml-1">Location</label>
                    <input type="text" name="location" value={serviceForm.location} onChange={handleServiceInputChange} placeholder="Studio/On-site" className="w-full px-4 py-3 bg-white border border-charcoal-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-accent transition-all text-charcoal-black" />
                  </div>
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-charcoal-black/5 bg-white shrink-0 flex justify-end gap-3">
                <button type="button" onClick={closeServiceModal} className="px-6 py-3.5 border border-charcoal-black/10 text-charcoal-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-warm-ivory transition-colors">Cancel</button>
                <button onClick={handleSubmitService} disabled={isSaving} className="px-8 py-3.5 bg-charcoal-black text-gold-accent rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader color="#C9A24D" size={14} /> : <Save size={14} />} 
                  {isSaving ? "Saving..." : "Publish Service"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminServicePage;