import React from "react";
import { Check, CircleDollarSign } from "lucide-react";

const SidebarFilter = ({
  categories = [],
  selectedCategories = [],
  onToggleCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  clearFilters,
}) => {
  const hasActiveFilters = selectedCategories.length > 0 || minPrice || maxPrice;

  return (
    <div className="bg-white rounded-[2rem] border border-charcoal-black/5 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-10">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-playfair font-bold text-charcoal-black">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-black text-red-500 hover:text-charcoal-black transition-colors uppercase tracking-widest border-b border-red-500/20"
          >
            Reset
          </button>
        )}
      </div>

      {/* Category Section */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-gold-accent font-inter text-[10px] font-black uppercase tracking-[0.3em]">
            Collections
          </span>
          <div className="h-px flex-1 bg-charcoal-black/5" />
        </div>
        
        <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.name);
            return (
              <label
                key={cat._id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleCategory(cat.name)}
                    className="peer sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border transition-all duration-300 flex items-center justify-center ${
                      isSelected
                        ? "bg-gold-accent border-gold-accent shadow-lg shadow-gold-accent/20"
                        : "border-gray-200 bg-gray-50 group-hover:border-gold-accent"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                  </div>
                </div>
                <span className={`font-inter text-sm transition-colors ${
                    isSelected ? "text-charcoal-black font-bold" : "text-slate-gray group-hover:text-charcoal-black"
                  }`}
                >
                  {cat.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* --- REFINED PRICE RANGE SECTION --- */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-gold-accent font-inter text-[10px] font-black uppercase tracking-[0.3em]">
            Price Range
          </span>
          <div className="h-px flex-1 bg-charcoal-black/5" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Min Price Field */}
            <div className="relative group">
              <label className="text-[9px] font-black text-slate-gray uppercase tracking-widest ml-1 mb-1.5 block">
                From
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-black/40 text-sm font-medium pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-8 pr-4 py-3.5 text-sm font-bold text-charcoal-black placeholder:text-gray-300 focus:bg-white focus:outline-none focus:border-gold-accent focus:ring-4 focus:ring-gold-accent/5 transition-all"
                />
              </div>
            </div>

            {/* Max Price Field */}
            <div className="relative group">
              <label className="text-[9px] font-black text-slate-gray uppercase tracking-widest ml-1 mb-1.5 block">
                To
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-black/40 text-sm font-medium pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="No Limit"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-8 pr-4 py-3.5 text-sm font-bold text-charcoal-black placeholder:text-gray-300 focus:bg-white focus:outline-none focus:border-gold-accent focus:ring-4 focus:ring-gold-accent/5 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2 pt-2">
            <CircleDollarSign size={14} className="text-gold-accent/40" />
            <p className="text-[10px] text-slate-gray/60 font-medium italic">
              Prices exclude shipping & taxes
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-6 border-t border-charcoal-black/5 flex items-center gap-3 text-gold-accent">
        <span className="text-[9px] uppercase font-black tracking-[0.2em]">Bespoke Ritual Collection</span>
      </div>
    </div>
  );
};

export default SidebarFilter;