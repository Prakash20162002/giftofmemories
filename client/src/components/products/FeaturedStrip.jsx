import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; 
import { Link } from "react-router-dom"; 
import { ArrowRight } from "lucide-react"; // Added for premium button interaction
import axios from "axios";
import ProductCard from "./ProductCard";
import Loader from "../Loader";

const FeaturedStrip = ({ onProductClick }) => {
  const [bestsellers, setBestsellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/shop/get-bestsellers`
        );
        setBestsellers(response.data);
      } catch (error) {
        console.error("Error fetching bestsellers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBestsellers();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-warm-ivory/30 py-16 md:py-24 flex justify-center items-center h-[400px]">
        <Loader color="#C9A24D" />
      </div>
    );
  }

  if (!bestsellers || bestsellers.length === 0) return null;

  return (
    <section className="bg-warm-ivory/30 py-16 md:py-24 overflow-hidden border-y border-charcoal-black/5">
      <div className="max-w-[1400px] mx-auto">
        
        {/* ---------------- HEADER SECTION ---------------- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12 px-4 sm:px-6 md:px-12">
          <div>
            <span className="text-gold-accent font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-2 block">
              Curated Favorites
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-charcoal-black leading-tight">
              Most Popular
            </h2>
          </div>
          
          {/* Desktop 'View All' Link */}
          <Link 
            to="/shop" 
            className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-gray hover:text-charcoal-black transition-colors group"
          >
            View Entire Collection
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-gold-accent" />
          </Link>
        </div>

        {/* ---------------- HORIZONTAL SCROLL TRACK ---------------- */}
        <div 
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 md:px-12 pt-4 pb-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {bestsellers.map((product, index) => (
            <motion.div 
              key={product._id} 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              // Changed snap-center to snap-start so cards align with the left padding
              className="w-[260px] sm:w-[300px] md:w-[340px] snap-start shrink-0"
            >
              <ProductCard product={product} onClick={onProductClick} />
            </motion.div>
          ))}

          {/* Spacer Div: Guarantees padding is respected on the right-most edge when fully scrolled */}
          <div className="w-1 md:w-6 shrink-0" aria-hidden="true" />
        </div>

        {/* Mobile 'View All' Button (Hidden on Desktop) */}
        <div className="px-4 sm:hidden flex justify-center -mt-4">
          <Link 
            to="/shop" 
            className="flex items-center justify-center w-full py-4 rounded-xl border border-charcoal-black/10 gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal-black hover:bg-warm-ivory transition-colors shadow-sm"
          >
            View Entire Collection <ArrowRight size={14} className="text-gold-accent" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedStrip;