"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ChevronLeft, ChevronRight, Sparkles, Tag } from "lucide-react";
import axios from "axios";

const SLIDE_DURATION = 6000;

const FloatingOffers = () => {
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);

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

  /* Progress bar + auto-advance */
  useEffect(() => {
    if (!isVisible || isMinimized || offers.length <= 1) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const startTime = performance.now();
    let raf;

    const tick = (now) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, isMinimized, currentIndex, offers.length]);

  const goTo = useCallback(
    (idx, e) => {
      e?.stopPropagation();
      setCurrentIndex((idx + offers.length) % offers.length);
    },
    [offers.length]
  );

  if (!offers.length || !isVisible) return null;

  const current = offers[currentIndex];

  return (
    <AnimatePresence mode="wait">
      {isMinimized ? (
        /* ── MINIMIZED: sleek pill ─────────────────────────────────────── */
        <motion.button
          key="minimized-pill"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.04 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-24 left-5 z-[100] flex items-center gap-2.5 px-4 py-2.5 bg-charcoal-black border border-gold-accent/40 rounded-full shadow-[0_0_24px_rgba(201,162,77,0.25)] backdrop-blur-md group cursor-pointer"
        >
          {/* Animated pulsing dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-accent" />
          </span>
          <span className="font-inter text-[10px] font-black uppercase tracking-[0.25em] text-gold-accent">
            {offers.length} Offer{offers.length > 1 ? "s" : ""}
          </span>
          <Tag size={12} className="text-gold-accent/70" />
        </motion.button>
      ) : (
        /* ── EXPANDED PANEL ────────────────────────────────────────────── */
        <motion.div
          key="expanded-panel"
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-5 z-[100] w-[320px] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/8"
          style={{ background: "#0c0c0c" }}
        >
          {/* ── Progress bar ─────────────────────────────────────────────── */}
          {offers.length > 1 && (
            <div className="absolute top-0 inset-x-0 h-[2px] bg-white/5 z-30">
              <motion.div
                key={currentIndex}
                className="h-full bg-gradient-to-r from-gold-accent/80 to-gold-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* ── Header bar ───────────────────────────────────────────────── */}
          <div className="relative z-20 flex items-center justify-between px-4 pt-4 pb-0">
            <div className="flex items-center gap-2">
              <Sparkles size={11} className="text-gold-accent animate-pulse" />
              <span className="font-inter text-[9px] font-black uppercase tracking-[0.3em] text-gold-accent">
                Special Offers
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Dot indicators */}
              {offers.length > 1 && offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => goTo(idx, e)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-4 h-1.5 bg-gold-accent"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50"
                  }`}
                />
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                className="ml-2 w-5 h-5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <X size={11} />
              </button>
            </div>
          </div>

          {/* ── Image area ───────────────────────────────────────────────── */}
          <div className="relative h-[200px] mt-3 mx-3 rounded-xl overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={current._id || currentIndex}
                src={current.image}
                alt={current.title}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/20 to-transparent" />

            {/* Prev / Next arrows */}
            {offers.length > 1 && (
              <>
                <button
                  onClick={(e) => goTo(currentIndex - 1, e)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-gold-accent hover:text-charcoal-black text-white rounded-full z-20 backdrop-blur-sm transition-all duration-200"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={(e) => goTo(currentIndex + 1, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-gold-accent hover:text-charcoal-black text-white rounded-full z-20 backdrop-blur-sm transition-all duration-200"
                >
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>

          {/* ── Content area ─────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="px-4 pt-3 pb-4"
            >
              {/* Offer index / count */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-inter text-[8px] uppercase tracking-[0.25em] text-white/25 font-bold">
                  Offer {currentIndex + 1} / {offers.length}
                </span>
                {current.badge && (
                  <span className="font-inter text-[8px] font-black uppercase tracking-wider text-charcoal-black bg-gold-accent px-2 py-0.5 rounded-md">
                    {current.badge}
                  </span>
                )}
              </div>

              <h3 className="font-playfair text-base font-bold text-white leading-snug mb-1 line-clamp-1">
                {current.title}
              </h3>
              <p className="font-inter text-white/45 text-[11px] leading-relaxed line-clamp-2 mb-3">
                {current.description}
              </p>

              {/* Thin gold separator */}
              <div className="h-[1px] w-full bg-gradient-to-r from-gold-accent/30 to-transparent mb-3" />

              {current.link ? (
                <a
                  href={current.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full px-4 py-2.5 bg-gold-accent hover:bg-[#d4a93e] text-charcoal-black font-inter text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Claim Offer</span>
                  <div className="w-5 h-5 rounded-lg bg-charcoal-black/15 flex items-center justify-center">
                    <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </div>
                </a>
              ) : (
                <div className="w-full py-2.5 bg-white/5 border border-white/8 text-white/40 font-inter text-[10px] font-bold uppercase tracking-widest text-center rounded-xl">
                  No Link Available
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingOffers;