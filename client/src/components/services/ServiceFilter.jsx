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
    <div className="sticky top-20 md:top-24 z-40 w-full px-4 mb-10">
      {/* Floating Island Filter Bar */}
      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md border border-charcoal-black/5 rounded-2xl md:rounded-full p-2 md:p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        
        {/* Quick Package Filter (Pills) */}
        <div className="relative flex-1 overflow-hidden">
          {/* Subtle fade effect on mobile overflow */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden" />
          
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 px-2">
            <button
              onClick={() => updateFilter("packageId", "all")}
              className={`cursor-pointer px-6 py-2.5 rounded-full text-xs font-inter font-bold transition-all duration-300 border-0 whitespace-nowrap uppercase tracking-widest hover:scale-102 active:scale-98 ${
                activeFilter.packageId === "all"
                  ? "bg-charcoal-black text-gold-accent shadow-[0_4px_12px_rgba(15,15,15,0.15)]"
                  : "bg-transparent text-slate-gray/70 hover:text-gold-accent hover:bg-gold-accent/5"
              }`}
            >
              All
            </button>
            {packages.map((pkg) => (
              <button
                key={pkg._id}
                onClick={() => updateFilter("packageId", pkg._id)}
                className={`cursor-pointer px-6 py-2.5 rounded-full text-xs font-inter font-bold transition-all duration-300 border-0 whitespace-nowrap uppercase tracking-widest hover:scale-102 active:scale-98 ${
                  activeFilter.packageId === pkg._id
                    ? "bg-charcoal-black text-gold-accent shadow-[0_4px_12px_rgba(15,15,15,0.15)]"
                    : "bg-transparent text-slate-gray/70 hover:text-gold-accent hover:bg-gold-accent/5"
                }`}
              >
                {pkg.title}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filter Toggle */}
        <div className="px-2 md:px-0">
          <button
            ref={toggleRef}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`cursor-pointer flex items-center justify-center gap-2 px-6 py-2.5 w-full md:w-auto rounded-full text-xs font-inter font-bold transition-all duration-300 border uppercase tracking-widest shrink-0 hover:scale-102 active:scale-98 ${
              isFilterOpen
                ? "bg-gold-accent text-charcoal-black border-gold-accent shadow-[0_4px_12px_rgba(201,162,77,0.2)]"
                : "bg-warm-ivory/50 text-charcoal-black/80 border-charcoal-black/10 hover:border-gold-accent/30 hover:bg-gold-accent/5 hover:text-gold-accent"
            }`}
          >
            {isFilterOpen ? <X size={14} /> : <Filter size={14} />}
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden max-w-5xl mx-auto"
          >
            <div
              ref={filterRef}
              className="mt-4 p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-charcoal-black/5 grid grid-cols-1 md:grid-cols-2 gap-8 mb-2"
            >
              {/* Price Range */}
              <div className="space-y-5">
                <h4 className="font-playfair font-bold text-lg text-charcoal-black flex items-center gap-2">
                  <div className="w-1 h-4 bg-gold-accent rounded-full" />
                  Investment Range
                </h4>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-black/35 text-xs font-bold font-inter">₹</span>
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
                      className="w-full pl-7 pr-3 py-2.5 bg-gray-50/50 border border-charcoal-black/10 rounded-xl text-sm font-inter focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent/30 transition-all cursor-text text-charcoal-black font-medium"
                    />
                  </div>
                  <span className="text-gray-300">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-black/35 text-xs font-bold font-inter">₹</span>
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
                      className="w-full pl-7 pr-3 py-2.5 bg-gray-50/50 border border-charcoal-black/10 rounded-xl text-sm font-inter focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent/30 transition-all cursor-text text-charcoal-black font-medium"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="3000000"
                    step="25000"
                    value={activeFilter.priceRange[1]}
                    onChange={(e) =>
                      updateFilter("priceRange", [activeFilter.priceRange[0], Number(e.target.value)])
                    }
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gold-accent"
                  />
                  <div className="flex justify-between text-[10px] text-slate-gray font-bold uppercase tracking-wider mt-3">
                    <span>Min: ₹{activeFilter.priceRange[0].toLocaleString()}</span>
                    <span>Max: ₹{activeFilter.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Selected Package Details */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-playfair font-bold text-lg text-charcoal-black mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gold-accent rounded-full" />
                    Current Selection
                  </h4>
                  <div className="bg-[#FAF9F6] border border-gold-accent/10 rounded-xl p-4 md:p-5">
                    {activeFilter.packageId === "all" ? (
                      <p className="text-xs md:text-sm font-inter text-slate-gray leading-relaxed font-light">
                        Currently viewing all photography and cinematography collections. Use pills to filter specific portfolios.
                      </p>
                    ) : (
                      <div>
                        <p className="font-playfair font-bold text-charcoal-black text-base mb-1">
                          {packages.find(p => p._id === activeFilter.packageId)?.title}
                        </p>
                        <p className="text-xs font-inter text-slate-gray leading-relaxed line-clamp-2 font-light">
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
                      priceRange: [0, 3000000],
                    });
                  }}
                  className="cursor-pointer flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-bold uppercase tracking-widest text-charcoal-black/60 hover:text-gold-accent border border-charcoal-black/10 hover:border-gold-accent/30 rounded-xl bg-warm-ivory/30 transition-all duration-300 hover:shadow-sm hover:scale-101 active:scale-99"
                >
                  <RotateCcw size={12} />
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceFilter;