import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react"; // Assuming you are using lucide-react

const MobileFilterDrawer = ({
  isOpen,
  onClose,
  categories = [],
  selectedCategories = [],
  onToggleCategory,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Dark Backdrop Overlay */}
          {/* Clicking this dark area will close the drawer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-charcoal-black/60 backdrop-blur-sm"
          />

          {/* 2. The Drawer (Sliding in from the Right) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // Takes up 85% of the screen so the user can still see the page peeking out
            className="fixed inset-y-0 right-0 z-[120] w-[85%] max-w-sm bg-warm-ivory flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-charcoal-black/10 shrink-0">
              <h3 className="text-2xl font-playfair text-charcoal-black font-semibold">
                Filters
              </h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-charcoal-black/60 hover:text-charcoal-black transition-colors rounded-full hover:bg-charcoal-black/5"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Filter Options */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                return (
                  // 3. Large, tap-friendly custom buttons instead of tiny checkboxes
                  <button
                    key={cat._id}
                    onClick={() => onToggleCategory(cat.name)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-gold-accent/15 border-gold-accent text-charcoal-black"
                        : "bg-white border-transparent text-charcoal-black/70 shadow-sm"
                    }`}
                  >
                    <span className="font-inter text-sm font-medium">
                      {cat.name}
                    </span>
                    
                    {/* Custom Checkbox UI */}
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-gold-accent"
                          : "border-2 border-charcoal-black/20"
                      }`}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 4. Sticky Footer with Action Button */}
            <div className="p-6 border-t border-charcoal-black/10 bg-warm-ivory shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 bg-charcoal-black text-warm-ivory font-inter text-sm uppercase tracking-widest font-semibold rounded-full shadow-lg shadow-black/20 hover:bg-black transition-colors"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterDrawer;