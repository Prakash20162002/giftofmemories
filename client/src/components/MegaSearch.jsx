import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MegaSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // NEW: Search state
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, productsRes, packagesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/services/services`),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/shop/get-products`),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/services/packages`)
        ]);
        setServices(servicesRes.data || []);
        setProducts(productsRes.data || []);
        setPackages(packagesRes.data || []);
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery(""); // Clear search on close
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const getPackageId = (service) => {
    if (!service?.package) return null;
    return service.package?._id?.toString() || service.package?.toString() || null;
  };

  // NEW: Memoized Filtered Data Logic
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const filteredServices = services.filter(s => 
      s.title.toLowerCase().includes(query)
    );

    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(query)
    );

    const grouped = packages.map((pkg) => ({
      packageTitle: pkg.title,
      packageId: pkg._id,
      services: filteredServices.filter((s) => {
        const pkgId = getPackageId(s);
        return pkgId && pkgId.toString() === pkg._id.toString();
      }),
    })).filter(group => group.services.length > 0);

    const unassigned = filteredServices.filter((s) => !getPackageId(s));

    return { grouped, unassigned, products: filteredProducts };
  }, [searchQuery, services, products, packages]);

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={menuRef} className="relative z-[100] w-full max-w-5xl mx-auto">
      {/* Search Bar Trigger - Now with Input */}
      <motion.div
        className={`flex items-center justify-between px-4 md:px-6 py-3 md:py-4 transition-all duration-300 ${
          isOpen
            ? "bg-gold-accent text-charcoal-black rounded-t-xl shadow-lg"
            : "bg-white/90 backdrop-blur-md text-charcoal-black rounded-xl shadow-lg hover:shadow-xl"
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3 w-full">
          <Search className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${isOpen ? "text-charcoal-black" : "text-gray-500"}`} />
          
          <input
            type="text"
            placeholder={isOpen ? "Type to search..." : "Search for services or products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={`w-full bg-transparent focus:outline-none font-inter font-medium text-sm sm:text-base md:text-lg placeholder:transition-colors ${
              isOpen ? "text-charcoal-black placeholder:text-charcoal-black/40" : "text-gray-700"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-black/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          )}
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </motion.div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 md:p-6 flex flex-col gap-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto overscroll-contain custom-scrollbar">
              
              {/* Grouped Services */}
              {filteredData.grouped.map((group) => (
                <div key={group.packageId} className="flex flex-col gap-2 md:gap-3">
                  <h3 className="font-playfair text-[10px] md:text-xs font-bold text-gold-accent uppercase tracking-[0.2em]">
                    {group.packageTitle}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.services.map((service) => (
                      <button
                        key={service._id}
                        onClick={() => handleServiceClick(service._id)}
                        className="font-inter text-xs sm:text-sm text-charcoal-black bg-gray-50 hover:bg-gold-accent hover:text-white px-4 py-2 rounded-full transition-all duration-200 border border-gray-100 hover:border-gold-accent"
                      >
                        {service.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Unassigned */}
              {filteredData.unassigned.length > 0 && (
                <div className="flex flex-col gap-2 md:gap-3">
                  <h3 className="font-playfair text-[10px] md:text-xs font-bold text-gold-accent uppercase tracking-[0.2em]">
                    Specialized Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredData.unassigned.map((service) => (
                      <button
                        key={service._id}
                        onClick={() => handleServiceClick(service._id)}
                        className="font-inter text-xs sm:text-sm text-charcoal-black bg-gray-50 hover:bg-gold-accent hover:text-white px-4 py-2 rounded-full border border-gray-100"
                      >
                        {service.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {filteredData.products.length > 0 && (
                <div className="flex flex-col gap-2 md:gap-3 border-t border-gray-50 pt-4">
                  <h3 className="font-playfair text-[10px] md:text-xs font-bold text-gold-accent uppercase tracking-[0.2em]">
                    Bespoke Products
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredData.products.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => { navigate('/shop'); setIsOpen(false); }}
                        className="font-inter text-xs sm:text-sm text-charcoal-black bg-gray-50 hover:bg-gold-accent hover:text-white px-4 py-2 rounded-full border border-gray-100"
                      >
                        {product.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredData.grouped.length === 0 && filteredData.unassigned.length === 0 && filteredData.products.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-gray italic font-playfair">No matches found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-gray-50 px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-100">
              <button onClick={() => { navigate("/services"); setIsOpen(false); }} className="text-xs text-gold-accent hover:text-charcoal-black font-bold uppercase tracking-widest transition-colors">
                View All Experiences →
              </button>
              <button onClick={() => { navigate("/shop"); setIsOpen(false); }} className="text-xs text-gold-accent hover:text-charcoal-black font-bold uppercase tracking-widest transition-colors">
                View Samogri Shop →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MegaSearch;