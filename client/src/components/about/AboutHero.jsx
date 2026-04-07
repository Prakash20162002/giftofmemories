import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";
import aboutHeroBg from "../../assets/images/about-hero.png";

const AboutHero = () => {
  const [heroData, setHeroData] = useState({
    title: "The Story Behind The Lens",
    subtitle: "About Us",
    description: "We don't just capture images; we preserve the feelings that make life beautiful.",
    breadcrumb: "Gift of memories • About",
    backgroundImage: "",
  });
  // FIX 3: Added loading state to prevent the "white flash" while the image downloads
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/page-hero/about`
        );
        if (response.data) {
          setHeroData(response.data);
        }
      } catch (error) {
        console.error("Error fetching about hero data:", error);
      }
    };
    fetchHeroData();
  }, []);

  return (
    <motion.section
      // FIX 2: Replaced whileHover with an automatic entrance animation
      className="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-charcoal-black flex items-center justify-center"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: isLoaded ? 0.6 : 0 
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroData.backgroundImage || aboutHeroBg}
          alt="About Gift of Memories"
          onLoad={() => setIsLoaded(true)}
          className="w-full h-full object-cover"
        />
        
        {/* FIX 1: Safe Contrast Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/80 via-transparent to-charcoal-black/90" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-12 md:mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Missing Data Restored: Subtitle & Breadcrumbs */}
          {heroData.breadcrumb && (
            <div className="flex items-center justify-center space-x-2 text-[10px] md:text-xs font-inter uppercase tracking-[0.3em] text-gold-accent mb-6 font-bold">
              <Link to="/" className="hover:text-warm-ivory transition-colors">
                Gift of memories
              </Link>
              <span className="opacity-50 text-warm-ivory">•</span>
              <span className="text-warm-ivory/80">About</span>
            </div>
          )}

          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl text-warm-ivory mb-6 font-bold tracking-tight drop-shadow-2xl">
            {heroData.title}
          </h1>
          
          <p className="font-inter text-base md:text-xl text-warm-ivory/90 font-light max-w-2xl mx-auto leading-relaxed px-4">
            {heroData.description}
          </p>

          {/* Decorative element to anchor the text */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-[1px] bg-gold-accent mx-auto mt-10"
          />
        </motion.div>
      </div>

      {/* The Section Transition Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-warm-ivory to-transparent z-10 pointer-events-none" />
    </motion.section>
  );
};

export default AboutHero;