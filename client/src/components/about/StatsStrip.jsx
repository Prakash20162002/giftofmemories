import { motion } from "framer-motion";

const stats = [
  { value: "8+", label: "Years of Experience" },
  { value: "500+", label: "Happy Couples" },
  { value: "1200+", label: "Events Covered" },
  { value: "50+", label: "Cities Travelled" },
];

const StatsStrip = () => {
  return (
    // FIX 1: Increased padding for breathing room and added an overflow-hidden wrapper
    <section className="relative bg-gold-accent py-16 md:py-24 overflow-hidden border-y border-charcoal-black/10">
      
      {/* Subtle Texture - Makes the gold look like high-end paper or foil */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* FIX 2: Added Tailwind 'divide' utilities for elegant separator lines */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-4 md:gap-0 divide-transparent md:divide-x divide-charcoal-black/10">
          
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              // FIX 3: Replaced scale with a smooth, upward glide
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center flex flex-col items-center justify-center group md:px-6"
            >
              {/* Added a subtle hover scale for micro-interactivity */}
              <h4 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-charcoal-black font-bold mb-3 transform group-hover:scale-110 transition-transform duration-500">
                {stat.value}
              </h4>
              
              {/* Upgraded typography spacing for luxury feel */}
              <span className="font-inter text-[10px] md:text-xs text-charcoal-black/70 uppercase tracking-[0.2em] font-bold">
                {stat.label}
              </span>
            </motion.div>
          ))}
          
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;