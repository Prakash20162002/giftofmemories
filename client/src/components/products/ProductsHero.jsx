import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const ProductsHero = () => {
  const [heroData, setHeroData] = useState({
    title: "Our Products",
    description: "Curated photography products crafted to preserve your memories forever.",
    backgroundImage: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/page-hero/get/shop`);
        if (response.data) setHeroData(response.data);
      } catch (error) { console.error("Error fetching shop hero:", error); }
    };
    fetchHeroData();
  }, []);

  return (
    // REDUCED HEIGHT: Changed from min-h-[450px] to min-h-[250px] md:min-h-[300px]
    <section className="relative h-[30vh] min-h-[250px] md:min-h-[300px] w-full overflow-hidden bg-charcoal-black flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: isLoaded ? 0.6 : 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroData.backgroundImage || "/shop-bg.jpg"}
          alt=""
          onLoad={() => setIsLoaded(true)}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/80 via-transparent to-charcoal-black/90" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: "50px" }} transition={{ delay: 0.5 }} className="h-[2px] bg-gold-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-playfair font-bold text-warm-ivory mb-4 tracking-tight drop-shadow-lg">
            {heroData.title}
          </h1>
          <p className="text-warm-ivory/85 text-sm md:text-lg font-inter max-w-2xl mx-auto leading-relaxed font-light">
            {heroData.description}
          </p>
        </motion.div>
      </div>

      {/* REDUCED FADE: Changed h-24 to h-12 */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#FAF9F6] to-transparent z-10" />
    </section>
  );
};

export default ProductsHero;