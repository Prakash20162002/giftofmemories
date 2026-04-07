import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, RotateCcw } from "lucide-react";

const ServiceFilter = ({ activeFilter, setActiveFilter, packages = [] }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const toggleRef = useRef(null);
  const filterRef = useRef(null);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateFilter = (key, value) => {
    setActiveFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="sticky top-16 md:top-20 z-40 bg-warm-ivory/95 backdrop-blur-md border-b border-charcoal-black/5 py-3 md:py-4 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex items-center justify-between gap-4">
          
          {/* Quick Package Filter (Pills) */}
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-warm-ivory to-transparent z-10 pointer-events-none md:hidden" />
            
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => updateFilter("packageId", "all")}
                className={`cursor-pointer px-5 py-2 rounded-full text-xs md:text-sm font-inter font-bold transition-all duration-300 border whitespace-nowrap uppercase tracking-wider ${
                  activeFilter.packageId === "all"
                    ? "bg-charcoal-black text-gold-accent border-charcoal-black shadow-lg shadow-black/10"
                    : "bg-white text-charcoal-black/60 border-charcoal-black/10 hover:border-gold-accent hover:text-gold-accent hover:-translate-y-0.5"
                }`}
              >
                All
              </button>
              {packages.map((pkg) => (
                <button
                  key={pkg._id}
                  onClick={() => updateFilter("packageId", pkg._id)}
                  className={`cursor-pointer px-5 py-2 rounded-full text-xs md:text-sm font-inter font-bold transition-all duration-300 border whitespace-nowrap uppercase tracking-wider ${
                    activeFilter.packageId === pkg._id
                      ? "bg-charcoal-black text-gold-accent border-charcoal-black shadow-lg shadow-black/10"
                      : "bg-white text-charcoal-black/60 border-charcoal-black/10 hover:border-gold-accent hover:text-gold-accent hover:-translate-y-0.5"
                  }`}
                >
                  {pkg.title}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filter Toggle */}
          <button
            ref={toggleRef}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`cursor-pointer flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-inter font-bold transition-all duration-300 border uppercase tracking-widest shrink-0 ${
              isFilterOpen
                ? "bg-gold-accent text-charcoal-black border-gold-accent shadow-md"
                : "bg-white text-charcoal-black border-charcoal-black/10 hover:border-gold-accent hover:-translate-y-0.5"
            }`}
          >
            {isFilterOpen ? <X size={16} /> : <Filter size={16} />}
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expanded Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                ref={filterRef}
                className="mt-6 p-6 md:p-8 bg-white rounded-2xl shadow-2xl border border-charcoal-black/5 grid grid-cols-1 md:grid-cols-2 gap-8 mb-4"
              >
                {/* Price Range */}
                <div className="space-y-5">
                  <h4 className="font-playfair font-bold text-xl text-charcoal-black">
                    Investment Range
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-black/30 text-xs font-bold font-inter">₹</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={activeFilter.priceRange[0]}
                        onChange={(e) =>
                          updateFilter("priceRange", [
                            Number(e.target.value),
                            activeFilter.priceRange[1],
                          ])
                        }
                        className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-charcoal-black/5 rounded-xl text-sm font-inter focus:outline-none focus:border-gold-accent transition-all cursor-text"
                      />
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-black/30 text-xs font-bold font-inter">₹</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={activeFilter.priceRange[1]}
                        onChange={(e) =>
                          updateFilter("priceRange", [
                            activeFilter.priceRange[0],
                            Number(e.target.value),
                          ])
                        }
                        className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-charcoal-black/5 rounded-xl text-sm font-inter focus:outline-none focus:border-gold-accent transition-all cursor-text"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="5000"
                      value={activeFilter.priceRange[1]}
                      onChange={(e) =>
                        updateFilter("priceRange", [activeFilter.priceRange[0], Number(e.target.value)])
                      }
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gold-accent"
                    />
                    <div className="flex justify-between text-[10px] text-slate-gray font-bold uppercase tracking-tighter mt-3">
                      <span>Min: ₹{activeFilter.priceRange[0].toLocaleString()}</span>
                      <span>Max: ₹{activeFilter.priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Package Details */}
                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-playfair font-bold text-xl text-charcoal-black mb-3">
                      Current Selection
                    </h4>
                    <div className="bg-warm-ivory/50 border border-gold-accent/10 rounded-xl p-4 md:p-5">
                      {activeFilter.packageId === "all" ? (
                        <p className="text-sm font-inter text-slate-gray leading-relaxed">
                          Currently viewing all photography and cinematography collections.
                        </p>
                      ) : (
                        <div>
                          <p className="font-playfair font-bold text-charcoal-black text-lg mb-1">
                            {packages.find(p => p._id === activeFilter.packageId)?.title}
                          </p>
                          <p className="text-xs md:text-sm font-inter text-slate-gray leading-relaxed line-clamp-2">
                            {packages.find(p => p._id === activeFilter.packageId)?.description || "Custom collection details."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveFilter({
                        packageId: "all",
                        priceRange: [0, 500000],
                      });
                    }}
                    className="cursor-pointer flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-bold uppercase tracking-widest text-charcoal-black/40 hover:text-gold-accent border border-charcoal-black/5 hover:border-gold-accent rounded-xl transition-all duration-300 hover:shadow-md"
                  >
                    <RotateCcw size={14} />
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ServiceFilter;