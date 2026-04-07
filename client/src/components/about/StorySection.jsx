import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { TextGenerateEffect } from "../Text-Generate-effect";
import Loader from "../Loader";

const StorySection = () => {
  const [storyData, setStoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/about/get-about`
        );
        setStoryData(response.data);
      } catch (error) {
        console.error("Error fetching story data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStoryData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 bg-warm-ivory min-h-[60vh] flex items-center justify-center">
        <Loader color="#C9A24D" />
      </section>
    );
  }

  return (
    <section className="py-16 md:py-32 bg-warm-ivory overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* 1. Image Side: Editorial Frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} // Changed to Y for better mobile entry
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-1/2 relative px-4 md:px-0"
          >
            {/* Background Offset Frame */}
            <div className="absolute inset-0 border border-gold-accent/30 rounded-3xl translate-x-3 translate-y-3 md:translate-x-6 md:translate-y-6 -z-10" />
            
            <div className="aspect-[4/5] bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
              <img
                src={storyData?.storyImage || "/about-us.jpg"}
                alt="Our Story"
                className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110"
                onError={(e) => { e.target.src = "/placeholder.png"; }}
              />
            </div>
          </motion.div>

          {/* 2. Text Side: Boutique Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left"
          >
            <div className="relative">
              <span className="text-gold-accent font-bold text-[9px] md:text-xs uppercase tracking-[0.3em] mb-4 block">
                Our Philosophy
              </span>
              
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-black mb-6 md:mb-8 leading-tight">
                {storyData?.storyTitle || "Crafting Memories Since 2016"}
              </h2>
              
              <div className="mb-8 md:mb-10 min-h-[100px]">
                <TextGenerateEffect
                  words={storyData?.storyContent || "Every frame tells a story. We believe in capturing the fleeting moments that define a lifetime..."}
                  className="font-inter leading-relaxed text-sm sm:text-base md:text-lg text-slate-gray/90"
                  // FIX: Reduced duration from 1.5 to 0.5 for much faster generation
                  duration={0.5} 
                  appearingColor="#C9A24D" 
                  finalColor="#4A4A4A" 
                />
              </div>

              {/* Signature Reveal */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                // FIX: Reduced delay from 1.5 to 0.6 so it appears right after the fast text
                transition={{ delay: 0.6, duration: 1 }} 
                className="mt-6 md:mt-8 border-t border-charcoal-black/5 pt-6 md:pt-8"
              >
                <span className="font-playfair text-xl md:text-3xl text-gold-accent italic drop-shadow-sm block">
                  {storyData?.storySignature || "— Gift of Memories Team"}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;