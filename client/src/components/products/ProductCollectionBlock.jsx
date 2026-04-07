import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Sparkles, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductCollectionBlock = ({ collection, onProductClick }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  const { displayStyle, products, name, description } = collection;

  // Handle Scroll Buttons Logic for Carousel
  const toggleArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Shared Header Component
  const SectionHeader = ({ icon: Icon, label, centered = false }) => (
    <div className={`mb-10 ${centered ? "text-center" : "text-left"}`}>
      <div className={`inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gold-accent/10 rounded-full border border-gold-accent/30 shadow-sm ${centered ? "mx-auto" : ""}`}>
        <Icon size={16} className="text-gold-accent" />
        <span className="text-gold-accent text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <h2 className="font-playfair text-3xl md:text-5xl text-charcoal-black mb-4 leading-tight">
        {name}
      </h2>
      {description && (
        <p className="text-slate-gray font-inter max-w-2xl text-sm md:text-base leading-relaxed mb-6">
          {description}
        </p>
      )}
      {centered && (
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-accent to-transparent mx-auto mt-4" />
      )}
    </div>
  );

  // --- GRID DISPLAY ---
  if (displayStyle === "grid" || displayStyle === "featured") {
    const isFeatured = displayStyle === "featured";
    
    return (
      <section className="py-12 md:py-24 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`relative rounded-[2.5rem] p-6 md:p-16 border border-gold-accent/20 shadow-2xl transition-all duration-500 ${
              isFeatured 
                ? "bg-gradient-to-br from-[#FFFCF5] via-[#FFF9ED] to-[#FDF5E6] border-2 border-gold-accent/40" 
                : "bg-gradient-to-br from-[#FDF9F3] via-white to-[#F9F3E8]"
            }`}
          >
            {isFeatured && (
              <>
                {/* Responsive Corners */}
                <div className="absolute top-0 left-0 w-12 h-12 md:w-24 md:h-24 border-t-4 border-l-4 border-gold-accent rounded-tl-[2.5rem] opacity-60" />
                <div className="absolute bottom-0 right-0 w-12 h-12 md:w-24 md:h-24 border-b-4 border-r-4 border-gold-accent rounded-br-[2.5rem] opacity-60" />
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #C9A24D 1px, transparent 0)`, backgroundSize: "32px 32px" }} />
              </>
            )}

            <div className="relative z-10">
              <SectionHeader 
                icon={isFeatured ? Star : Sparkles} 
                label={isFeatured ? "Featured Selection" : "Curated Collection"} 
                centered={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full max-w-[300px]"
                  >
                    <ProductCard product={product} onClick={onProductClick} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- CAROUSEL DISPLAY ---
  if (displayStyle === "carousel") {
    return (
      <section className="py-12 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-16 border border-gold-accent/10 shadow-xl overflow-hidden relative">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <SectionHeader icon={Star} label="Most Popular" />
              
              {/* Desktop Controls */}
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => scroll("left")}
                  className={`p-4 rounded-full border-2 transition-all duration-300 ${
                    showLeftArrow 
                      ? "border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-white shadow-lg" 
                      : "border-gray-100 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className={`p-4 rounded-full border-2 transition-all duration-300 ${
                    showRightArrow 
                      ? "border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-white shadow-lg" 
                      : "border-gray-100 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Scroll Area - Optimized for Mobile Swipe */}
            <div 
              ref={scrollRef}
              onScroll={toggleArrows}
              className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0"
            >
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="w-[280px] md:w-[320px] shrink-0 snap-center first:pl-2 last:pr-2"
                >
                  <ProductCard product={product} onClick={onProductClick} />
                </div>
              ))}
            </div>

            {/* Mobile Scroll Hint */}
            <div className="mt-8 flex items-center justify-center gap-2 md:hidden">
               <div className="text-[10px] uppercase tracking-widest text-slate-gray font-bold animate-pulse">
                 Swipe to explore
               </div>
               <ArrowRight size={12} className="text-gold-accent" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
};

export default ProductCollectionBlock;