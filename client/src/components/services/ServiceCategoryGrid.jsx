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
      className={`grid gap-3 sm:gap-6 lg:gap-12 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 items-start ${
        isSingle ? "grid-cols-1" : "grid-cols-2"
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
        className="cursor-pointer flex flex-col md:flex-row group relative bg-white overflow-hidden"
      >
        
        {/* IMAGE PART */}
        <div className={`w-full relative overflow-hidden order-1 md:order-2 flex-shrink-0 ${
          isSingle ? "md:w-[50%] h-48 md:h-[450px]" : "md:w-[42%] h-28 sm:h-40 md:h-auto"
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

          <div className="hidden md:block absolute inset-y-0 -left-1 w-24 h-full z-20 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full fill-white">
              <path d="M100,0 C25,0 25,100 100,100 L0,100 L0,0 Z" />
            </svg>
          </div>

          {/* Floating Action Circle */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-30">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0, backgroundColor: isOpen ? "#C9A24D" : "#ffffff" }}
              className="w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg border border-charcoal-black/5 text-charcoal-black transition-shadow group-hover:shadow-xl"
            >
              <Plus className={`w-3 h-3 md:w-5 md:h-5 ${isOpen ? "text-white" : "text-gold-accent"}`} />
            </motion.div>
          </div>
        </div>

        {/* CONTENT PART */}
        <div className={`flex-1 p-3 sm:p-5 md:p-10 flex flex-col justify-center z-10 order-2 md:order-1 ${
          isSingle ? "md:p-16" : ""
        }`}>
          <div className="mb-3 md:mb-6">
            <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-gold-accent mb-1 md:mb-2 block transition-transform group-hover:translate-x-1">
              Curated Menu
            </span>
            <h3 className={`font-playfair font-bold text-charcoal-black leading-tight transition-colors group-hover:text-gold-accent ${
              isSingle ? "text-2xl md:text-6xl" : "text-base sm:text-2xl md:text-4xl lg:text-5xl"
            }`}>
              {category.title}
            </h3>
          </div>
          
          <div className="flex flex-col xl:flex-row xl:items-center gap-2 md:gap-4 mt-auto">
            <div className="w-fit px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-charcoal-black text-gold-accent text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-lg">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gold-accent animate-pulse" />
              {serviceCount} {serviceCount === 1 ? "Pkg" : "Pkgs"}
            </div>
            {category.startingPrice && (
              <p className="text-[9px] md:text-sm font-bold text-slate-gray/80 font-inter">
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
            <div className="p-3 md:p-10">
              <div className={`grid gap-2 md:gap-4 ${isSingle ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {category.services?.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => navigate(`/services/${service._id}`)}
                    className="cursor-pointer group bg-white p-2.5 md:p-5 rounded-xl md:rounded-2xl border border-charcoal-black/5 hover:border-gold-accent/40 flex items-center gap-3 md:gap-5 transition-all duration-300 shadow-sm hover:shadow-xl text-left hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-warm-ivory border border-charcoal-black/5 p-1.5 md:p-2 shrink-0">
                      {service.logo ? (
                        <img src={service.logo} className="w-full h-full object-contain" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-accent font-playfair font-bold text-lg md:text-xl">
                          {service.title?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-playfair font-bold text-sm md:text-lg text-charcoal-black group-hover:text-gold-accent transition-colors leading-tight mb-0.5 md:mb-1">
                        {service.title}
                      </h4>
                      <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-gray flex items-center gap-1 group-hover:gap-2 transition-all">
                        Details <ArrowRight size={10} className="text-gold-accent" />
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