import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FilterSortBar = ({
  filters = [],
  activeFilter,
  onFilterChange,
  sortOptions = [],
  activeSort,
  onSortChange,
}) => {
  return (
    // FIX 1: Swapped manual logic for CSS 'sticky'. 
    // It's smoother, requires no JS scroll listeners, and needs no 'spacer' div.
    <div className="sticky top-16 md:top-20 z-40 bg-warm-ivory/95 backdrop-blur-md border-b border-charcoal-black/5 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Filters - With horizontal scroll hint */}
        <div className="relative w-full md:w-auto overflow-hidden">
          {/* Subtle mobile scroll fade indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-warm-ivory to-transparent z-10 pointer-events-none md:hidden" />
          
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                  className={`relative px-5 py-2 rounded-full text-[11px] md:text-xs font-bold transition-colors duration-500 whitespace-nowrap uppercase tracking-widest ${
                    isActive ? "text-charcoal-black" : "text-slate-gray hover:text-charcoal-black"
                  }`}
                >
                  {/* FIX 2: Added the 'Sliding Pill' animation for a premium feel */}
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterPill"
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

        {/* Sort Dropdown - Bespoke Design */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-gray/60">
            Sort By
          </span>
          <div className="relative group min-w-[160px]">
            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full bg-white border border-charcoal-black/5 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal-black cursor-pointer appearance-none focus:outline-none focus:border-gold-accent transition-all shadow-sm group-hover:shadow-md"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* Custom Icon replaces the hardcoded Data-URI SVG */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-gray group-hover:text-gold-accent transition-colors">
              <ChevronDown size={14} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSortBar;