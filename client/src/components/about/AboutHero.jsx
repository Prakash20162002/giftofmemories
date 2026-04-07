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
      className="relative h-[40vh] min-h-[300px] md:h-[50vh] md:min-h-[400px] w-full overflow-hidden bg-charcoal-black flex items-center justify-center"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: 1, 
            // FIX 1: Increased opacity to 0.7 so the photo is actually visible!
            opacity: isLoaded ? 0.7 : 0 
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroData.backgroundImage || aboutHeroBg}
          alt="About Gift of Memories"
          onLoad={() => setIsLoaded(true)}
          className="w-full h-full object-cover"
        />
        
        {/* FIX 2: Replaced the muddy multi-gradient with a clean, simple dark wash */}
        <div className="absolute inset-0 bg-charcoal-black/40" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-8 md:mt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {heroData.breadcrumb && (
            <div className="flex items-center justify-center space-x-2 text-[10px] md:text-xs font-inter uppercase tracking-[0.3em] text-gold-accent mb-3 md:mb-5 font-bold">
              <Link to="/" className="hover:text-warm-ivory transition-colors">
                Gift of memories
              </Link>
              <span className="opacity-50 text-warm-ivory">•</span>
              <span className="text-warm-ivory/80">About</span>
            </div>
          )}

          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-warm-ivory mb-3 md:mb-5 font-bold tracking-tight drop-shadow-lg">
            {heroData.title}
          </h1>
          
          <p className="font-inter text-sm md:text-lg text-warm-ivory/90 font-light max-w-2xl mx-auto leading-relaxed px-2 md:px-4 drop-shadow-md">
            {heroData.description}
          </p>

          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-[1px] bg-gold-accent mx-auto mt-6 md:mt-8"
          />
        </motion.div>
      </div>

      {/* FIX 3: COMPLETELY DELETED THE UGLY BOTTOM FADE GRADIENT */}
      {/* The section will now have a crisp, premium, straight cut into the white content below it. */}

    </motion.section>
  );
};

export default AboutHero;