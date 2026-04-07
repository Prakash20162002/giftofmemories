import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const MostBookedPackages = ({ services = [] }) => {
  // If no services are passed, we show nothing
  if (!services || services.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-warm-ivory/30 border-y border-charcoal-black/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-gold-accent mb-3">
              <Sparkles size={14} className="animate-pulse" /> Highly Requested
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-charcoal-black font-bold leading-tight">
              Most Booked <span className="italic text-gold-accent">Packages</span>
            </h2>
          </div>
          <Link 
            to="/services" 
            className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-gray hover:text-charcoal-black transition-colors group"
          >
            View All Services 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-gold-accent" />
          </Link>
        </div>

        {/* ---------------- DYNAMIC GRID ---------------- */}
        {/* FIX: 'justify-center' ensures that if there's only 1 card, 
            it stays in the middle and remains a normal size (max-w-md).
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 justify-center">
          {services.map((service, index) => (
            <motion.div
              key={service.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-full max-w-md mx-auto" // Keeps cards from growing too large
            >
              <Link
                to={`/services/${service.id}`}
                className="group relative block h-[400px] md:h-[500px] overflow-hidden rounded-[2rem] shadow-lg border border-charcoal-black/5 bg-charcoal-black"
              >
                {/* Image Layer */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black via-charcoal-black/20 to-transparent opacity-90 transition-opacity duration-500" />

                {/* Content Layer */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold-accent mb-2 block">
                      {service.category || "Premium Service"}
                    </span>
                    <h3 className="font-playfair text-2xl md:text-3xl text-warm-ivory font-bold mb-3">
                      {service.title}
                    </h3>
                    <p className="font-inter text-xs md:text-sm text-warm-ivory/70 line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2 text-gold-accent text-[10px] font-bold uppercase tracking-widest">
                      Reserve Now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                     <Sparkles size={16} className="text-gold-accent" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Link (Visible only on small screens) */}
        <div className="mt-12 md:hidden flex justify-center">
          <Link 
            to="/services" 
            className="flex items-center gap-2 px-8 py-4 bg-charcoal-black text-gold-accent rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl"
          >
            Explore All Services <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default MostBookedPackages;