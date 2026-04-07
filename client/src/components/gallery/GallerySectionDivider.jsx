import { motion } from "framer-motion";
import { Camera, Video } from "lucide-react";

const GallerySectionDivider = () => {
  return (
    // FIX 1: Responsive padding (py-12 on mobile vs py-20 on desktop) to maintain vertical rhythm
    <section className="relative py-8 md:py-10 bg-charcoal-black overflow-hidden border-y border-white/5">
      
      {/* Background Pattern - Optimized with will-change for smooth scrolling */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #C9A24D 1.5px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-center gap-4 md:gap-16">
          
          {/* Photos Label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <div className="hidden sm:flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold-accent/5 border border-gold-accent/20 text-gold-accent/60">
              <Camera size={20} strokeWidth={1.5} />
            </div>
            <span className="font-playfair text-lg md:text-2xl text-warm-ivory/40 uppercase tracking-[0.2em] font-light">
              Stills
            </span>
          </motion.div>

          {/* Center Divider Logic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex flex-col items-center"
          >
            {/* Top Line - Uses a softer gradient */}
            <div className="w-px h-6 md:h-10 bg-gradient-to-b from-transparent via-gold-accent/40 to-gold-accent" />

            {/* Center Box */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
              
              {/* FIX 2: Added a subtle blur to the rotating border to prevent 'gradient flickering' on mobile */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-xl border border-gold-accent/20 blur-[0.5px]"
                style={{
                  background: `conic-gradient(from 0deg, transparent, rgba(201, 162, 77, 0.4), transparent)`,
                }}
              />

              {/* Inner Box - Premium Glassmorphism */}
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-charcoal-black border border-gold-accent/40 flex items-center justify-center shadow-[0_0_40px_rgba(201,162,77,0.15)] backdrop-blur-md">
                <span className="font-playfair text-gold-accent text-2xl md:text-3xl font-bold italic">
                  &
                </span>
              </div>
            </div>

            {/* Bottom Line */}
            <div className="w-px h-6 md:h-10 bg-gradient-to-t from-transparent via-gold-accent/40 to-gold-accent" />
          </motion.div>

          {/* Videos Label */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <span className="font-playfair text-lg md:text-2xl text-warm-ivory/40 uppercase tracking-[0.2em] font-light">
              Motion
            </span>
            <div className="hidden sm:flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold-accent/5 border border-gold-accent/20 text-gold-accent/60">
              <Video size={20} strokeWidth={1.5} />
            </div>
          </motion.div>
        </div>

        {/* Horizontal Detail Lines */}
        <div className="flex items-center justify-center mt-6 md:mt-10">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            // FIX 3: Explicitly set origin so the lines 'grow' out from the center dot
            style={{ originX: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "circOut" }}
            className="h-[1px] w-20 md:w-64 bg-gradient-to-r from-transparent to-gold-accent/30"
          />
          <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="w-1.5 h-1.5 rounded-full border border-gold-accent/50 mx-4" 
          />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            style={{ originX: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "circOut" }}
            className="h-[1px] w-20 md:w-64 bg-gradient-to-l from-transparent to-gold-accent/30"
          />
        </div>
      </div>
    </section>
  );
};

export default GallerySectionDivider;