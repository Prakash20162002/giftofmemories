import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Plus, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../Loader";

const ServiceCategoryGrid = ({ packages, isLoading }) => {
  const location = useLocation();
  const isServicesPage = location.pathname === "/services";

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

  return (
    <div 
      className={`grid gap-3 md:gap-6 w-full max-w-[90rem] mx-auto px-2 sm:px-6 lg:px-8 items-start ${
        isServicesPage 
          ? "grid-cols-2" // Always 2 columns on mobile and desktop
          : (packages.length === 1 ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3") 
      }`}
    >
      {packages.map((pkg) => (
        isServicesPage 
          ? <ServiceCardDetailed key={pkg._id} category={pkg} />
          : <ServiceCardHome key={pkg._id} category={pkg} isSingle={packages.length === 1} />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* VARIANT 1: HOME PAGE STYLE                                                 */
/* -------------------------------------------------------------------------- */
const ServiceCardHome = ({ category, isSingle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div layout className="bg-white rounded-xl md:rounded-[2.5rem] shadow-sm border border-charcoal-black/5 overflow-hidden h-fit">
      <div role="button" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex flex-col group bg-white">
        <div className="h-32 sm:h-56 md:h-64 relative overflow-hidden">
          <img src={category.image} alt={category.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-30">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-white shadow-lg text-gold-accent">
              <Plus size={14} />
            </div>
          </div>
        </div>
        <div className="p-3 md:p-8">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gold-accent mb-1 md:mb-2 block">Curated Menu</span>
          <h3 className="font-playfair font-bold text-charcoal-black text-sm md:text-2xl group-hover:text-gold-accent">{category.title}</h3>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="bg-warm-ivory/10 border-t border-charcoal-black/5 p-3 md:p-4">
             {category.services?.map((s) => (
                <button key={s._id} onClick={() => navigate(`/services/${s._id}`)} className="w-full flex items-center justify-between p-2 md:p-3 bg-white rounded-lg md:rounded-xl mb-2 text-left border border-charcoal-black/5 hover:border-gold-accent/30 transition-colors">
                  <span className="font-playfair font-bold text-xs md:text-sm text-charcoal-black">{s.title}</span>
                  <ArrowRight size={12} className="text-gold-accent" />
                </button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* VARIANT 2: SERVICES PAGE STYLE                                             */
/* -------------------------------------------------------------------------- */
const ServiceCardDetailed = ({ category }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const serviceCount = category.services?.length || 0;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, type: "spring", bounce: 0 } }}
      className={`bg-white rounded-2xl md:rounded-[2.2rem] border border-charcoal-black/5 overflow-hidden flex flex-col transition-all hover:shadow-lg ${
        isOpen ? "col-span-2" : "col-span-1"
      }`}
    >
      <div onClick={() => setIsOpen(!isOpen)} className="flex flex-col sm:flex-row gap-2 md:gap-8 p-2 md:p-5 cursor-pointer group">
        
        {/* Category Image */}
        <div className={`relative overflow-hidden rounded-xl md:rounded-[1.5rem] shrink-0 transition-all duration-500 ${
          isOpen ? "w-full sm:w-[32%] h-24 md:h-64" : "w-full sm:w-[42%] h-28 md:h-56"
        }`}>
          <img src={category.image} alt={category.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-charcoal-black/5 group-hover:bg-transparent transition-colors duration-500" />
        </div>

        {/* Category Content */}
        <div className="flex flex-col justify-center py-2 md:py-4 px-1 md:pr-6 w-full">
          <h3 className="font-playfair text-sm md:text-4xl font-bold text-charcoal-black mb-1 md:mb-3 group-hover:text-gold-accent transition-colors uppercase tracking-tight">
            {category.title}
          </h3>
          
          <p className="hidden sm:block font-inter text-xs md:text-sm text-slate-gray leading-relaxed mb-8 line-clamp-2 md:line-clamp-3">
             Professional {category.title} services tailored to capture your legacy with cinematic precision and authentic emotions.
          </p>
          
          <div className="mt-auto flex items-center justify-between w-full pt-1 sm:pt-0 border-t sm:border-none border-charcoal-black/5">
            <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs font-bold uppercase tracking-wider md:tracking-[0.2em] text-charcoal-black group-hover:text-gold-accent transition-colors pt-2 sm:pt-0">
              VIEW <ChevronDown size={12} className={`md:w-3.5 md:h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </div>
            <div className="flex items-center pt-2 sm:pt-0">
               <span className="text-[7px] md:text-[10px] font-bold text-slate-gray/60 uppercase tracking-widest px-2 md:px-3 py-1 bg-charcoal-black/5 rounded-md">
                 {serviceCount} PKGS
               </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#FAF9F6] border-t border-charcoal-black/5"
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 p-3 md:p-8">
              {category.services?.map((service) => (
                <button
                  key={service._id}
                  onClick={(e) => { e.stopPropagation(); navigate(`/services/${service._id}`); }}
                  className="group bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-charcoal-black/5 flex flex-col text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gold-accent/40"
                >
                  
                  {/* FIX: Massive size upgrade! Replaced tiny w-14 h-14 box with full-width aspect-video image container */}
                  <div className="w-full aspect-[4/3] md:aspect-[16/10] rounded-lg md:rounded-xl overflow-hidden bg-warm-ivory/50 mb-3 md:mb-5 shrink-0 flex items-center justify-center border border-charcoal-black/5 relative">
                    {service.logo || service.image ? (
                        <img src={service.logo || service.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                    ) : (
                        <div className="text-gold-accent font-playfair font-bold text-3xl opacity-50">{service.title[0]}</div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                  
                  <h4 className="font-playfair font-bold text-[11px] md:text-xl text-charcoal-black mb-1 md:mb-2 group-hover:text-gold-accent transition-colors uppercase line-clamp-2 leading-tight">
                    {service.title}
                  </h4>
                  
                  <p className="text-[8px] md:text-xs text-slate-gray mb-3 md:mb-6 font-inter leading-relaxed opacity-80 line-clamp-2">
                    Explore specific inclusions & pricing
                  </p>
                  
                  <div className="mt-auto pt-2 md:pt-4 border-t border-charcoal-black/5 w-full flex justify-between items-center text-[7px] md:text-[10px] font-black uppercase tracking-widest text-charcoal-black/40 group-hover:text-gold-accent transition-colors">
                    DETAILS <ArrowRight size={10} className="md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ServiceCategoryGrid;