import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

// Placeholder imports (Ensure these paths match your project structure)
import gallery2 from "../../assets/images/gallery-2.png";
import gallery3 from "../../assets/images/gallery-3.png";

const featuredData = [
  {
    id: "royal-wedding-bundle",
    title: "Royal Wedding Bundle",
    subtitle: "Photography + 2 Films",
    image: gallery2,
  },
  {
    id: "brand-starter-kit",
    title: "Brand Starter Kit",
    subtitle: "20 Products + 5 Reels",
    image: gallery3,
  },
  {
    id: "portrait-special",
    title: "Portrait Special",
    subtitle: "2 Hour Studio Session",
    image: gallery2,
  },
  {
    id: "event-highlights",
    title: "Event Highlights",
    subtitle: "Full coverage + Teaser",
    image: gallery3,
  },
];

const FeaturedServices = () => {
  return (
    <section className="py-16 md:py-24 bg-warm-ivory/40 border-y border-charcoal-black/5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12 px-4 sm:px-6 md:px-12">
          <div>
            <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gold-accent mb-2">
              <Sparkles size={14} /> Highly Requested
            </span>
            <h3 className="font-playfair text-3xl md:text-4xl text-charcoal-black font-bold">
              Trending Packages
            </h3>
          </div>
          
          <Link 
            to="/services" 
            className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-gray hover:text-charcoal-black transition-colors group"
          >
            View All Services 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-gold-accent" />
          </Link>
        </div>

        {/* Scroll Container */}
        {/* FIX: Added cross-browser invisible scrollbar utilities and vertical padding to prevent shadow clipping */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-6 md:px-12 pt-4 pb-8">
          
          {featuredData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-20px" }}
              className="snap-start shrink-0"
            >
              <Link
                to={`/services/${item.id}`}
                className="bg-white p-4 md:p-5 rounded-[1.5rem] w-[280px] md:w-[340px] shadow-sm border border-charcoal-black/5 flex items-center gap-4 md:gap-5 cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group block"
              >
                {/* Image Container */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 bg-warm-ivory relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle overlay for contrast */}
                  <div className="absolute inset-0 bg-charcoal-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Text Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-playfair text-lg md:text-xl font-bold text-charcoal-black leading-tight mb-1.5 truncate group-hover:text-gold-accent transition-colors duration-300">
                    {item.title}
                  </h4>
                  <p className="font-inter text-[10px] md:text-xs text-slate-gray font-medium uppercase tracking-widest truncate">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* FIX: Blank spacer div. This forces the scroll container to add padding after the very last card on mobile. */}
          <div className="w-1 md:w-6 shrink-0" aria-hidden="true" />

        </div>

        {/* Mobile View All Link */}
        <div className="mt-2 px-4 sm:hidden flex justify-center">
          <Link 
            to="/services" 
            className="flex items-center justify-center w-full py-4 rounded-xl border border-charcoal-black/10 gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-colors"
          >
            View All Services <ArrowRight size={14} className="text-gold-accent" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedServices;