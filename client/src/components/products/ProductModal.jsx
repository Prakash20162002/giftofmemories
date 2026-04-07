import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, ShoppingCart, ShieldCheck, ChevronRight } from "lucide-react";
import { useClientAuth } from "../../context/ClientAuthContext";
import { triggerWhatsApp } from "../../utils/whatsappHandler";

const ProductModal = ({ isOpen, onClose, product }) => {
  const { isClientLoggedIn, clientUser } = useClientAuth();

  // Prevent background scrolling when modal is open and handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Safely calculate discount
  const discountPrice = product ? Math.round(product.price * 0.85) : 0;

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            // flex-col on mobile, flex-row on desktop. max-h is crucial here.
            className="relative bg-white w-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button - Positioned absolutely inside the modal */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 md:top-5 md:right-5 z-[110] w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 md:bg-white/50 md:hover:bg-gold-accent backdrop-blur-md text-charcoal-black md:hover:text-white transition-all shadow-sm"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* Image Section - Adaptive height on mobile */}
            <div className="w-full md:w-1/2 h-[35vh] min-h-[240px] md:h-auto md:min-h-0 relative bg-warm-ivory shrink-0 group overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {isClientLoggedIn && (
                <div className="absolute top-4 left-4 bg-gold-accent text-charcoal-black text-[10px] font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg z-10 uppercase tracking-widest border border-white/20">
                  15% Off Deal
                </div>
              )}

              {/* Progress Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === 0 ? "w-6 md:w-8 bg-gold-accent shadow-sm" : "w-1.5 bg-white/60"}`} />
                ))}
              </div>
            </div>

            {/* Info Section - flex-1 ensures it takes remaining height and scrolls internally */}
            <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar flex flex-col flex-1">
              
              {/* Header Info */}
              <div className="mb-4 md:mb-6 pr-8 md:pr-0">
                <span className="text-gold-accent font-bold text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1.5 md:mb-2 block">
                  {product.category?.name || product.category}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-charcoal-black leading-tight">
                  {product.name}
                </h2>
              </div>

              {/* Pricing Display */}
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                {isClientLoggedIn ? (
                  <>
                    <span className="text-2xl md:text-3xl lg:text-4xl font-black text-charcoal-black">
                      ₹{discountPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-slate-400 line-through text-base md:text-lg font-medium">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl md:text-3xl lg:text-4xl font-black text-charcoal-black">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm text-slate-gray mb-6 md:mb-8 font-inter leading-relaxed">
                <p className="text-sm md:text-base">{product.description}</p>
                <div className="flex items-center gap-2 mt-3 md:mt-4 text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  <ShieldCheck size={14} className="shrink-0" /> 
                  Museum-grade Quality Guaranteed
                </div>
              </div>

              {/* Custom Options */}
              <div className="mb-8 md:mb-10">
                <label className="block text-[10px] font-bold text-charcoal-black uppercase tracking-widest mb-3 md:mb-4">
                  Select Presentation Style
                </label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {["Standard", "Premium", "Deluxe"].map((opt, idx) => (
                    <button
                      key={opt}
                      className={`py-2.5 md:py-3 rounded-lg md:rounded-xl border-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider md:tracking-widest transition-all duration-300 ${
                        idx === 0
                          ? "border-gold-accent bg-gold-accent/5 text-charcoal-black"
                          : "border-gray-200 text-slate-gray hover:border-gold-accent/40 hover:text-charcoal-black"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions - Switched to a flex layout so it doesn't break on narrow screens */}
              <div className="mt-auto flex gap-2 sm:gap-3 pt-4 border-t border-gray-100 md:border-none md:pt-0">
                <button
                  onClick={() => triggerWhatsApp(clientUser?.name || "Customer", product.name)}
                  className="flex-1 flex items-center justify-center gap-2 md:gap-3 bg-charcoal-black text-gold-accent font-bold py-3.5 md:py-5 rounded-xl md:rounded-2xl hover:bg-gold-accent hover:text-charcoal-black transition-all duration-300 shadow-xl shadow-charcoal-black/10"
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  <span className="text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] font-black truncate">
                    Buy Now
                  </span>
                </button>
                <button 
                  className="w-12 sm:w-14 md:w-16 shrink-0 flex items-center justify-center border-2 border-gray-200 rounded-xl md:rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all text-charcoal-black group"
                  aria-label="Share product"
                >
                  <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Return Button */}
              <button 
                onClick={onClose}
                className="mt-4 md:mt-6 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-gold-accent transition-colors flex items-center justify-center gap-1 w-full"
              >
                Return to Shop <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;