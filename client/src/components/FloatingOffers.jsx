"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import axios from "axios";

const FloatingOffers = () => {
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/offers/active`);
        if (response.data && response.data.length > 0) {
          setOffers(response.data);
          setTimeout(() => setIsVisible(true), 5000);
        }
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    if (!isVisible || isMinimized || offers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isVisible, isMinimized, offers.length]);

  if (!offers.length || !isVisible) return null;

  const nextOffer = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  const prevOffer = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const handleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(true);
  };

  return (
    // THE FIX: mode="wait" ensures the panel leaves before the button enters
    <AnimatePresence mode="wait">
      {isMinimized ? (
        <motion.button
          key="minimized-btn"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-24 left-6 z-[100] w-14 h-14 bg-charcoal-black border-2 border-gold-accent rounded-full shadow-[0_0_20px_rgba(201,162,77,0.3)] flex items-center justify-center text-gold-accent overflow-hidden group"
        >
          <Tag size={24} className="group-hover:hidden" />
          <span className="hidden group-hover:block text-[9px] font-bold uppercase tracking-widest text-center leading-tight">
            View<br />Offers
          </span>
        </motion.button>
      ) : (
        <motion.div
          key="expanded-panel"
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-6 z-[100] w-80 bg-charcoal-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 p-3 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
            <span className="text-gold-accent text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-black/50 rounded-md backdrop-blur-md">
              Special Offers
            </span>
            <button
              onClick={handleMinimize}
              className="w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-gold-accent hover:text-charcoal-black transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {offers.length > 1 && (
            <>
              <button
                onClick={prevOffer}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-gold-accent hover:text-charcoal-black text-white rounded-full z-20 backdrop-blur-md transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextOffer}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-gold-accent hover:text-charcoal-black text-white rounded-full z-20 backdrop-blur-md transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div className="relative h-[320px] bg-charcoal-black">
            {offers.map((offer, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={offer._id || idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-5 flex flex-col justify-end">
                    <h3 className="font-playfair text-xl font-bold text-white mb-1 leading-tight shadow-black drop-shadow-lg">
                      {offer.title}
                    </h3>
                    <p className="text-warm-ivory/80 text-xs line-clamp-2 mb-4 drop-shadow-md">
                      {offer.description}
                    </p>

                    {offer.link && (
                      <a
                        href={offer.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-gold-accent hover:bg-white text-charcoal-black text-[10px] font-black uppercase tracking-widest text-center rounded-lg transition-colors flex items-center justify-center gap-2 relative z-20"
                      >
                        Claim Offer <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {offers.length > 1 && (
            <div className="absolute bottom-20 right-4 flex flex-col gap-1.5 z-20">
              {offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`w-1.5 rounded-full transition-all duration-300 shadow-md ${
                    idx === currentIndex ? "h-4 bg-gold-accent" : "h-1.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingOffers;