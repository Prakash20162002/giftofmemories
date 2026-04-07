import { LayoutGrid, GripHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const filters = [
  "All",
  "Weddings",
  "Events",
  "Portraits",
  "Commercial",
  "Videos",
];

const GalleryFilter = ({
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode,
}) => {
  return (
    // FIX 3: Added backdrop-blur and refined the sticky offset
    <div className="sticky top-16 md:top-20 z-40 bg-warm-ivory/90 backdrop-blur-md border-b border-charcoal-black/5 py-2 md:py-4 transition-all duration-500">
      <div className="container mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Filters Wrapper */}
        <div className="relative w-full md:w-auto overflow-hidden">
          {/* FIX 2: Mobile scroll fade indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-warm-ivory to-transparent z-10 pointer-events-none md:hidden" />
          
          <div className="flex space-x-2 md:space-x-3 overflow-x-auto no-scrollbar py-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-5 py-2 rounded-full text-xs md:text-sm font-inter font-bold transition-colors duration-500 whitespace-nowrap uppercase tracking-widest ${
                    isActive ? "text-charcoal-black" : "text-slate-gray hover:text-charcoal-black"
                  }`}
                >
                  {/* FIX 1: Framer Motion layoutId creates the 'sliding pill' effect */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGalleryPill"
                      className="absolute inset-0 bg-gold-accent rounded-full shadow-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Toggle - Polished Design */}
        <div className="hidden md:flex items-center p-1 bg-charcoal-black/5 rounded-xl border border-charcoal-black/5">
          <button
            onClick={() => setViewMode("masonry")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === "masonry"
                ? "bg-white shadow-lg text-gold-accent scale-105"
                : "text-slate-gray hover:text-charcoal-black"
            }`}
            title="Masonry View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === "grid"
                ? "bg-white shadow-lg text-gold-accent scale-105"
                : "text-slate-gray hover:text-charcoal-black"
            }`}
            title="Grid View"
          >
            <GripHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryFilter;