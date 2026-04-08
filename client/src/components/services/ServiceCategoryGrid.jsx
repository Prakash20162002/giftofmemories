import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const ServiceCategoryGrid = ({ packages, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" color="#C9A24D" />
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-20 bg-white/40 rounded-[2.5rem] border border-dashed border-gold-accent/20 mx-4">
        <Sparkles className="mx-auto text-gold-accent/40 mb-4" size={40} />
        <p className="text-2xl font-playfair font-bold text-charcoal-black mb-2">Catalogue Empty</p>
        <p className="text-sm font-inter text-slate-gray">Our artisans are currently updating these collections.</p>
      </div>
    );
  }

  const isSingle = packages.length === 1;

  return (
    <div 
      // FIX 1: Responsive Grid. 1 col on mobile, 2 on tablet, 3 on large desktop.
      className={`grid gap-4 sm:gap-6 lg:gap-8 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 items-start ${
        isSingle ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {packages.map((pkg) => (
        <ServiceCard key={pkg._id} category={pkg} isSingle={isSingle} />
      ))}
    </div>
  );
};

const ServiceCard = ({ category, isSingle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const serviceCount = category.services?.length || 0;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={`bg-white rounded-2xl md:rounded-[2.5rem] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.08)] border border-charcoal-black/5 overflow-hidden transition-all duration-500 hover:shadow-2xl h-fit ${
        isSingle ? "max-w-5xl mx-auto" : ""
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex group relative bg-white overflow-hidden ${
          isSingle ? "flex-col md:flex-row" : "flex-col" // Always stack image on top of text unless it's a single featured card
        }`}
      >
        
        {/* IMAGE PART */}
        <div className={`w-full relative overflow-hidden flex-shrink-0 ${
          isSingle ? "md:w-[50%] h-48 md:h-[450px]" : "h-48 sm:h-56 md:h-64" // Fixed height for grid cards
        }`}>
          <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
            {category.image ? (
              <img src={category.image} alt={category.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-warm-ivory flex items-center justify-center text-gold-accent/20 text-5xl md:text-7xl font-playfair font-bold">
                {category.title?.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-charcoal-black/5 group-hover:bg-transparent transition-colors duration-500" />
          </div>

          {/* FIX 2: Diagonal cut effect only visible when image is side-by-side (isSingle) */}
          {isSingle && (
             <div className="hidden md:block absolute inset-y-0 -right-1 w-24 h-full z-20 pointer-events-none rotate-180">
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full fill-white">
                 <path d="M100,0 C25,0 25,100 100,100 L0,100 L0,0 Z" />
               </svg>
             </div>
          )}

          {/* Floating Action Circle */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0, backgroundColor: isOpen ? "#C9A24D" : "#ffffff" }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg border border-charcoal-black/5 text-charcoal-black transition-shadow group-hover:shadow-xl"
            >
              <Plus className={`w-4 h-4 md:w-5 md:h-5 ${isOpen ? "text-white" : "text-gold-accent"}`} />
            </motion.div>
          </div>
        </div>

        {/* CONTENT PART */}
        <div className={`flex-1 p-5 md:p-8 flex flex-col justify-center z-10 ${
          isSingle ? "md:p-16 text-left" : "text-left" // Always align text to the left for a modern editorial feel
        }`}>
          <div className="mb-4 md:mb-6">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-gold-accent mb-2 block transition-transform group-hover:translate-x-1">
              Curated Menu
            </span>
            <h3 className={`font-playfair font-bold text-charcoal-black leading-tight transition-colors group-hover:text-gold-accent ${
              isSingle ? "text-3xl md:text-6xl" : "text-2xl lg:text-3xl xl:text-4xl" // Scaled text for grid
            }`}>
              {category.title}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
             {/* Package Count Badge */}
            <div className="w-fit px-3 py-1.5 rounded-lg md:rounded-xl bg-charcoal-black text-gold-accent text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-pulse" />
              {serviceCount} {serviceCount === 1 ? "Pkg" : "Pkgs"}
            </div>
            
            {/* Price Info */}
            {category.startingPrice && (
              <p className="text-xs md:text-sm font-bold text-slate-gray/80 font-inter">
                Starts ₹{category.startingPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EXPANDED SECTION */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-warm-ivory/20 border-t border-charcoal-black/5"
          >
            <div className="p-4 md:p-8">
              {/* FIX 3: Services map to 1 column inside the card since the cards themselves are now in a grid */}
              <div className={`grid gap-3 md:gap-4 ${isSingle ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {category.services?.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => navigate(`/services/${service._id}`)}
                    className="cursor-pointer w-full group bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-charcoal-black/5 hover:border-gold-accent/40 flex items-center gap-3 md:gap-5 transition-all duration-300 shadow-sm hover:shadow-xl text-left hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-warm-ivory border border-charcoal-black/5 p-2 shrink-0">
                      {service.logo ? (
                        <img src={service.logo} className="w-full h-full object-contain" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-accent font-playfair font-bold text-xl md:text-2xl">
                          {service.title?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-playfair font-bold text-sm md:text-lg text-charcoal-black group-hover:text-gold-accent transition-colors leading-tight mb-1 line-clamp-1">
                        {service.title}
                      </h4>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-gray flex items-center gap-1 group-hover:gap-2 transition-all">
                        Details <ArrowRight size={12} className="text-gold-accent" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ServiceCategoryGrid;