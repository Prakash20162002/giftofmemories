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
      <div className="flex justify-center py-24">
        <Loader size="lg" color="#C9A24D" />
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-24 bg-white/40 rounded-[2.5rem] border border-dashed border-gold-accent/20 mx-4">
        <Sparkles className="mx-auto text-gold-accent/40 mb-4" size={40} />
        <p className="text-2xl font-playfair font-bold text-charcoal-black mb-2">Catalogue Empty</p>
        <p className="text-sm font-inter text-slate-gray">Our artisans are currently updating these collections.</p>
      </div>
    );
  }

  return (
    <div 
      className={`grid gap-6 md:gap-8 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 items-start ${
        isServicesPage 
          ? "grid-cols-2" // Always 2 columns on services page
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
    <motion.div layout className="bg-white rounded-[2rem] shadow-sm border border-charcoal-black/5 overflow-hidden h-fit transition-shadow hover:shadow-[0_20px_40px_rgba(201,162,77,0.06)] hover:border-gold-accent/20 duration-500">
      <div role="button" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex flex-col group bg-white">
        <div className="h-48 sm:h-56 md:h-64 relative overflow-hidden">
          <img src={category.image} alt={category.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-charcoal-black/10 group-hover:bg-charcoal-black/5 transition-colors duration-500" />
          <div className="absolute top-3 right-3 z-30">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md text-gold-accent group-hover:bg-gold-accent group-hover:text-white transition-all duration-300">
              <Plus size={16} />
            </div>
          </div>
        </div>
        <div className="p-5 md:p-8">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold-accent mb-2 block">Curated Menu</span>
          <h3 className="font-playfair font-bold text-charcoal-black text-lg md:text-2xl group-hover:text-gold-accent transition-colors duration-300 uppercase tracking-wide">{category.title}</h3>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="bg-warm-ivory/20 border-t border-charcoal-black/5 p-4 space-y-2 overflow-hidden"
          >
             {category.services?.map((s) => (
                <button key={s._id} onClick={() => navigate(`/services/${s.slug || s._id}`)} className="w-full flex items-center justify-between p-3 bg-white rounded-xl text-left border border-charcoal-black/5 hover:border-gold-accent/30 hover:bg-warm-ivory/10 hover:shadow-sm transition-all duration-300">
                  <span className="font-playfair font-bold text-xs md:text-sm text-charcoal-black/95">{s.title}</span>
                  <ArrowRight size={14} className="text-gold-accent" />
                </button>
             ))}
             
             {/* Dynamic explore button syncing Homepage cards with Services catalog */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 navigate(`/services?packageId=${category._id}`);
               }}
               className="w-full mt-3 py-3 bg-gold-accent text-charcoal-black font-inter font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl hover:bg-charcoal-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
             >
               Explore Full Detailed Packages <ArrowRight size={14} />
             </button>
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
      transition={{ layout: { duration: 0.5, type: "spring", bounce: 0.05 } }}
      className={`bg-white rounded-3xl border overflow-hidden flex flex-col transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.02)] ${
        isOpen 
          ? "col-span-2 border-gold-accent/30 shadow-[0_20px_50px_rgba(201,162,77,0.08)] bg-gradient-to-br from-white via-white to-warm-ivory/20" 
          : "col-span-1 border-charcoal-black/10 hover:border-gold-accent/30 hover:shadow-[0_20px_40px_rgba(201,162,77,0.05)]"
      }`}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex flex-col sm:flex-row gap-4 md:gap-8 p-4 md:p-6 cursor-pointer group select-none bg-white relative overflow-hidden"
      >
        {/* Subtle highlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Category Image */}
        <div className={`relative overflow-hidden rounded-2xl shrink-0 transition-all duration-700 border border-charcoal-black/5 group-hover:border-gold-accent/15 shadow-md ${
          isOpen ? "w-full sm:w-[35%] h-36 md:h-64" : "w-full sm:w-[45%] h-36 md:h-56"
        }`}>
          <img src={category.image} alt={category.title} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-charcoal-black/10 group-hover:bg-black/5 transition-colors duration-500" />
        </div>

        {/* Category Content */}
        <div className="flex flex-col justify-center py-2 pr-1 md:pr-4 w-full relative z-10">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 bg-gold-accent rounded-full animate-ping" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold-accent">Collection</span>
          </div>

          <h3 className="font-playfair text-lg md:text-3xl lg:text-4xl font-bold text-charcoal-black mb-1.5 group-hover:text-gold-accent transition-colors duration-300 uppercase tracking-wide">
            {category.title}
          </h3>
          <div className="w-8 h-[1px] bg-gold-accent/30 mb-3 md:mb-4 group-hover:w-16 transition-all duration-500 ease-out" />
          
          <p className="hidden sm:block font-inter text-xs md:text-sm text-slate-gray/80 leading-relaxed mb-6 font-light line-clamp-2 md:line-clamp-3">
             Professional {category.title.toLowerCase()} services tailored to capture your legacy with cinematic precision, authentic emotions, and artistic brilliance.
          </p>
          
          <div className="mt-auto flex items-center justify-between w-full pt-3 border-t border-charcoal-black/5">
            <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-charcoal-black group-hover:text-gold-accent transition-colors">
              {isOpen ? "COLLAPSE" : "EXPLORE PACKAGES"}{" "}
              <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? "rotate-180 text-gold-accent" : ""}`} />
            </div>
            <div>
               <span className="text-[8px] md:text-[10px] font-bold text-gold-accent bg-gold-accent/5 border border-gold-accent/15 px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                 {serviceCount} {serviceCount === 1 ? 'Package' : 'Packages'}
               </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-gradient-to-b from-[#FAF9F6]/80 to-white/90 backdrop-blur-sm border-t border-charcoal-black/5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 p-5 md:p-8">
              {category.services?.map((service) => (
                <button
                  key={service._id}
                  onClick={(e) => { e.stopPropagation(); navigate(`/services/${service.slug || service._id}`); }}
                  className="group bg-white p-5 rounded-2xl border border-charcoal-black/5 flex flex-col text-left transition-all duration-500 hover:shadow-[0_15px_30px_rgba(201,162,77,0.06)] hover:-translate-y-1.5 hover:border-gold-accent/25 relative overflow-hidden"
                >
                  {/* Card Glow Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gold-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Service Card Image */}
                  <div className="w-full aspect-[4/3] md:aspect-[16/10] rounded-xl overflow-hidden bg-warm-ivory/50 mb-4 shrink-0 flex items-center justify-center border border-charcoal-black/5 group-hover:border-gold-accent/15 relative shadow-sm transition-colors duration-500">
                    {service.logo || service.image || (service.images && service.images.length > 0) ? (
                        <img 
                          src={service.logo || service.image || service.images[0]} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                          alt={service.title} 
                        />
                    ) : (
                        <div className="text-gold-accent font-playfair font-bold text-3xl opacity-50">{service.title[0]}</div>
                    )}
                    <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                  
                  <h4 className="font-playfair font-bold text-sm md:text-base text-charcoal-black mb-1.5 group-hover:text-gold-accent transition-colors duration-300 uppercase line-clamp-1 leading-tight tracking-wide">
                    {service.title}
                  </h4>
                  
                  {/* Dynamic description using database text */}
                  <p className="text-[10px] md:text-xs text-slate-gray/70 mb-4 font-inter leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {service.shortDescription || service.description || "Explore specific package details, inclusions & booking plans."}
                  </p>
                  
                  {/* Luxury bottom info containing actual Price & details link */}
                  <div className="mt-auto pt-3 border-t border-charcoal-black/5 w-full flex justify-between items-center">
                    <span className="text-[10px] md:text-xs font-black text-gold-accent tracking-widest font-inter">
                      {service.price || "Contact Us"}
                    </span>
                    <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-charcoal-black/60 group-hover:text-gold-accent transition-all duration-300">
                      DETAILS <ArrowRight size={10} className="group-hover:translate-x-1.5 transition-transform duration-300 text-gold-accent" />
                    </div>
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