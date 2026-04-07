import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import galleryHeroBg from "../../assets/images/gallery-hero.png";

const GalleryHero = () => {
  return (
    <motion.section
      initial="initial"
      whileHover="hover"
      // FIX 1: Reduced mobile height from 60vh to 40vh, kept desktop at 50vh/55vh
      className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-charcoal-black flex items-center justify-center"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <motion.img
          variants={{
            initial: { scale: 1, opacity: 0.6 },
            hover: {
              scale: 1.08,
              opacity: 0.8,
              transition: { duration: 3, ease: "easeOut" },
            },
          }}
          src={galleryHeroBg}
          alt="Photography Gallery"
          className="w-full h-full object-cover"
        />
        {/* Dual-layer gradient for better text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/60 via-transparent to-charcoal-black/90" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-8 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center space-x-2 text-[10px] md:text-xs font-inter uppercase tracking-[0.3em] text-gold-accent mb-3 md:mb-6 font-bold">
            <Link to="/" className="hover:text-warm-ivory transition-colors">
              Gift of memories
            </Link>
            <span className="opacity-50 text-warm-ivory">•</span>
            <span className="text-warm-ivory/80">Gallery</span>
          </div>

          <h1 className="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-warm-ivory mb-3 md:mb-6 font-bold tracking-tight drop-shadow-2xl">
            Our Work
          </h1>
          
          {/* FIX 2: Reduced bottom margin on mobile (mb-4) to fit the smaller height */}
          <p className="font-inter text-sm md:text-xl text-muted-beige/90 mb-5 md:mb-8 font-light max-w-2xl mx-auto leading-relaxed px-2 md:px-4">
            A glimpse into moments we’ve had the privilege to capture. Every
            image tells a unique story of love, joy, and connection.
          </p>

          {/* Decorative element to anchor the design */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-[1px] bg-gold-accent mx-auto"
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default GalleryHero;