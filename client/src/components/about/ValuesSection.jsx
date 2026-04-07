import { motion } from "framer-motion";
import { Heart, Sparkles, Aperture } from "lucide-react"; 

const ValuesSection = () => {
  const values = [
    {
      icon: <Heart strokeWidth={1.5} className="w-6 h-6 md:w-7 md:h-7" />,
      title: "Emotional Depth",
      description:
        "Beyond the pose to find genuine feelings—unspoken words and tearful glances.",
    },
    {
      icon: <Sparkles strokeWidth={1.5} className="w-6 h-6 md:w-7 md:h-7" />,
      title: "Premium Quality",
      description:
        "Capturing RAW moments with meticulous processing for perfect pixels.",
    },
    {
      icon: <Aperture strokeWidth={1.5} className="w-6 h-6 md:w-7 md:h-7" />,
      title: "Timeless Style",
      description:
        "Classic, elegant, and real photographs that stay beautiful for years.",
    },
  ];

  return (
    // FIX: Scaled padding for mobile (py-16) vs desktop (py-32) to keep it compact
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle background element for depth */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-accent/20 to-transparent" />
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Header: Reduced bottom margin for mobile */}
        <div className="text-center mb-10 md:mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold-accent font-bold text-[9px] md:text-xs tracking-[0.3em] uppercase mb-2 md:mb-4 block"
          >
            Our Philosophy
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-playfair text-2xl md:text-5xl font-bold text-charcoal-black"
          >
            The Core of Our Craft
          </motion.h2>
        </div>

        {/* Grid: Tighter gaps for a smaller footprint on small screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-20px" }}
              className="flex flex-col items-center group text-center"
            >
              {/* Responsive Icon Container: Smaller on mobile (w-16) vs desktop (w-20) */}
              <div className="relative mb-6 md:mb-8">
                <div className="absolute inset-0 bg-gold-accent/5 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-warm-ivory/50 flex items-center justify-center text-gold-accent relative z-10 border border-charcoal-black/5 group-hover:bg-gold-accent group-hover:text-white transition-all duration-500 shadow-sm">
                  {value.icon}
                </div>
              </div>

              <h3 className="font-playfair text-lg md:text-2xl font-bold text-charcoal-black mb-3 md:mb-4">
                {value.title}
              </h3>
              
              {/* Divider: Slightly smaller for mobile */}
              <div className="w-6 h-[1px] bg-gold-accent/40 mb-4 md:mb-5 transition-all duration-500 group-hover:w-12 group-hover:bg-gold-accent" />

              <p className="font-inter text-slate-gray text-xs md:text-base leading-relaxed max-w-[280px] md:max-w-sm mx-auto">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-accent/20 to-transparent" />
    </section>
  );
};

export default ValuesSection;