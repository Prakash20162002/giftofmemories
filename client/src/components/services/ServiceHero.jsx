import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import serviceHeroBg from "../../assets/images/service-hero.png";

const ServiceHero = () => {
  const [heroData, setHeroData] = useState({
    title: "Our Photography Services",
    description:
      "Crafted experiences for weddings, events, portraits and brands. We turn moments into timeless memories.",
    breadcrumb: "Gift of memories • Services",
    backgroundImage: "",
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/page-hero/get/services`,
        );
        // Only update if we actually get data
        if (response.data) setHeroData(response.data);
      } catch (error) {
        console.error("Error fetching service hero:", error);
      }
    };
    fetchHeroData();
  }, []);

  const breadcrumbParts = heroData.breadcrumb?.split("•") || [
    "Gift of memories",
    "Services",
  ];

  return (
    <motion.section
      initial="initial"
      whileHover="hover"
      // FIX 3: Adjusted height for mobile (60vh) vs desktop (55vh) for better proportions
      className="relative h-[60vh] md:h-[55vh] w-full overflow-hidden bg-charcoal-black flex items-center justify-center"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <motion.img
          variants={{
            initial: { scale: 1, opacity: 0.6 },
            // FIX 1: Replaced the 'jittery x-axis shake' with a smooth cinematic zoom
            hover: {
              scale: 1.1,
              opacity: 0.8,
              transition: { duration: 2, ease: "easeOut" },
            },
          }}
          src={heroData.backgroundImage || serviceHeroBg}
          alt="Photography Services"
          className="w-full h-full object-cover"
        />
        {/* FIX 2: Added a dual-layer gradient for better text contrast across all image types */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/70 via-charcoal-black/40 to-charcoal-black/80" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} // Cinematic ease
        >
          {/* Breadcrumbs - Moved above Title for a more modern 'editorial' look */}
          <div className="flex items-center justify-center space-x-2 text-[10px] md:text-xs font-inter uppercase tracking-[0.3em] text-gold-accent mb-4 md:mb-6 font-bold">
            <Link to="/" className="hover:text-warm-ivory transition-colors">
              {breadcrumbParts[0]?.trim()}
            </Link>
            <span className="opacity-50 text-warm-ivory">•</span>
            <span className="text-warm-ivory/80">
              {breadcrumbParts[1]?.trim()}
            </span>
          </div>

          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl text-warm-ivory mb-6 font-bold tracking-tight drop-shadow-xl">
            {heroData.title}
          </h1>
          
          <p className="font-inter text-base md:text-xl text-muted-beige/90 mb-8 font-light max-w-2xl mx-auto leading-relaxed">
            {heroData.description}
          </p>

          {/* Decorative Divider Line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "80px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-[1px] bg-gold-accent mx-auto"
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ServiceHero;