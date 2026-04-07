import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import contactHeroBg from "../../assets/images/contact-hero.png";

const ContactHero = () => {
  const [heroData, setHeroData] = useState({
    title: "Get In Touch",
    description:
      "Ready to start your journey? We'd love to hear from you. Tell us about your vision, and we'll help bring it to life.",
    backgroundImage: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/page-hero/get/contact`
        );
        if (response.data) setHeroData(response.data);
      } catch (error) {
        console.error("Error fetching contact hero:", error);
      }
    };
    fetchHeroData();
  }, []);

  return (
    <section className="relative h-[55vh] min-h-[450px] w-full overflow-hidden bg-charcoal-black flex items-center justify-center">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <motion.img
          // FIX 1: Swapped the shake for a smooth, high-end "Ken Burns" entry zoom
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: isLoaded ? 0.6 : 0 // FIX 2: Controlled opacity in one place
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroData.backgroundImage || contactHeroBg}
          alt="Contact Studio"
          onLoad={() => setIsLoaded(true)}
          className="h-full w-full object-cover"
        />
        
        {/* FIX 3: Vertical dual-layer gradient for perfect centered text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/80 via-transparent to-charcoal-black/95" />
        <div className="absolute inset-0 bg-charcoal-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative Gold Accent Line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "40px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-[2px] bg-gold-accent mx-auto mb-6 md:mb-8"
          />

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-7xl text-warm-ivory mb-6 font-bold tracking-tight drop-shadow-2xl">
            {heroData.title}
          </h1>
          
          <p className="font-inter text-base md:text-xl text-warm-ivory/85 max-w-2xl mx-auto font-light leading-relaxed px-4">
            {heroData.description}
          </p>
        </motion.div>
      </div>

      {/* Optional: Subtle bottom fade to blend smoothly into the form section below */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
};

export default ContactHero;