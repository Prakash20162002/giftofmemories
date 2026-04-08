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
      className={`grid gap-6 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 items-start ${
        isServicesPage 
          ? "grid-cols-1 md:grid-cols-2" // 2-column layout for the clean 'Menu' look
          : (packages.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3") 
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
/* VARIANT 1: HOME PAGE STYLE (Standard Grid)                                 */
/* -------------------------------------------------------------------------- */
const ServiceCardHome = ({ category, isSingle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div layout className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-charcoal-black/5 overflow-hidden h-fit">
      <div role="button" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex flex-col group bg-white">
        <div className="h-48 sm:h-56 md:h-64 relative overflow-hidden">
          <img src={category.image} alt={category.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute top-3 right-3 z-30">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-lg text-gold-accent">
              <Plus size={16} />
            </div>
          </div>
        </div>
        <div className="p-5 md:p-8">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gold-accent mb-2 block">Curated Menu</span>
          <h3 className="font-playfair font-bold text-charcoal-black text-2xl group-hover:text-gold-accent">{category.title}</h3>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="bg-warm-ivory/10 border-t border-charcoal-black/5 p-4">
             {category.services?.map((s) => (
                <button key={s._id} onClick={() => navigate(`/services/${s._id}`)} className="w-full flex items-center justify-between p-3 bg-white rounded-xl mb-2 text-left border border-charcoal-black/5">
                  <span className="font-playfair font-bold text-sm">{s.title}</span>
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
/* VARIANT 2: SERVICES PAGE STYLE (Horizontal & Expandable)                   */
/* -------------------------------------------------------------------------- */
const ServiceCardDetailed = ({ category }) => {
  // FIXED: Strictly false by default so it opens exactly like your first image
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const serviceCount = category.services?.length || 0;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, type: "spring", bounce: 0 } }}
      className={`bg-white rounded-[1.5rem] md:rounded-[2.2rem] border border-charcoal-black/5 overflow-hidden flex flex-col transition-all hover:shadow-xl ${
        isOpen ? "md:col-span-2" : "col-span-1"
      }`}
    >
      {/* HEADER SECTION (Matches Image 1) */}
      <div onClick={() => setIsOpen(!isOpen)} className="flex flex-col sm:flex-row gap-4 md:gap-8 p-3 md:p-5 cursor-pointer group">
        
        {/* Category Image */}
        <div className={`relative overflow-hidden rounded-xl md:rounded-[1.5rem] shrink-0 transition-all duration-500 ${
          isOpen ? "w-full sm:w-[32%] h-48 md:h-64" : "w-full sm:w-[42%] h-48 md:h-56"
        }`}>
          <img src={category.image} alt={category.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-charcoal-black/5 group-hover:bg-transparent transition-colors duration-500" />
        </div>

        {/* Category Content */}
        <div className="flex flex-col justify-center py-2 md:py-4 pr-2 md:pr-6 w-full">
          <h3 className="font-playfair text-2xl md:text-4xl font-bold text-charcoal-black mb-3 group-hover:text-gold-accent transition-colors uppercase tracking-tight">
            {category.title}
          </h3>
          
          <p className="font-inter text-xs md:text-sm text-slate-gray leading-relaxed mb-8 line-clamp-2 md:line-clamp-3">
             Professional {category.title} services tailored to capture your legacy with cinematic precision and authentic emotions.
          </p>
          
          <div className="mt-auto flex items-center justify-between w-full">
            {/* View Packages Toggle */}
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-charcoal-black group-hover:text-gold-accent transition-colors">
              VIEW PACKAGES <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Package Count Label */}
            <div className="flex items-center gap-2">
               <span className="text-[9px] md:text-[10px] font-bold text-slate-gray/50 uppercase tracking-widest px-3 py-1 bg-warm-ivory/50 rounded-md">
                 {serviceCount} {serviceCount === 1 ? "Package" : "Packages"}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDED SECTION (Matches Image 2) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-warm-ivory/20 border-t border-charcoal-black/5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5 md:p-10">
              {category.services?.map((service) => (
                <button
                  key={service._id}
                  onClick={(e) => { e.stopPropagation(); navigate(`/services/${service._id}`); }}
                  className="group bg-white p-6 rounded-[1.5rem] border border-charcoal-black/5 hover:border-gold-accent/40 flex flex-col text-left transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Sub-package icon placeholder (The 'B' circle in your image) */}
                  <div className="w-12 h-12 rounded-xl bg-warm-ivory/50 p-2 mb-5 shrink-0 flex items-center justify-center">
                    {service.logo ? (
                        <img src={service.logo} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-gold-accent font-playfair font-bold text-xl">{service.title[0]}</div>
                    )}
                  </div>
                  
                  <h4 className="font-playfair font-bold text-lg md:text-xl text-charcoal-black mb-1 group-hover:text-gold-accent transition-colors uppercase">
                    {service.title}
                  </h4>
                  
                  <p className="text-[10px] md:text-[11px] text-slate-gray mb-6 font-inter leading-relaxed">
                    Explore specific inclusions & pricing
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-charcoal-black/5 flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-charcoal-black/40 group-hover:text-gold-accent">
                    DETAILS <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
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