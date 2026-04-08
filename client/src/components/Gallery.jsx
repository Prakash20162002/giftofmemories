import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import axios from "axios";

const defaultGalleryImages = [
  { id: 1, src: "/img1.jpeg", alt: "Srinjoy & Shalini", category: "Wedding" },
  { id: 2, src: "/img2.jpeg", alt: "Suman & Pallabi", category: "Wedding" },
];

const Gallery = () => {
  const [images, setImages] = useState(defaultGalleryImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const optimizeUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("f_auto,q_auto")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/section/stacked`);
        if (res.data?.length > 0) {
          setImages(res.data.map((img, i) => ({
            id: img._id || i,
            src: img.imageUrl,
            // FIX: Changed to look for img.alt first, since that's what the Admin panel saves!
            alt: img.alt || img.altText || "Featured Couple",
            category: img.category || "Selected Works",
          })));
        }
      } catch (e) { console.error("Gallery fetch failed", e); }
    };
    fetchGallery();
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev, isLightboxOpen]);

  const activeImage = images[currentIndex];

  return (
    <section id="portfolio" className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden group border-y border-white/5 bg-charcoal-black">
      <div className="sr-only">
        <h2>Professional Photography Portfolio - Gift of Memories</h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full z-0"
        >
          <img
            src={optimizeUrl(activeImage.src)}
            alt={activeImage.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/80 via-transparent to-charcoal-black/90" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-0 left-0 w-full z-20 text-center pt-12 md:pt-20 px-6 pointer-events-none">
        <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-warm-ivory font-bold tracking-tighter drop-shadow-2xl">
          Real <span className="italic text-gold-accent">Wedding Stories</span>
        </h2>
      </div>

      {/* Pinned the Couple's Data to the VERY BOTTOM */}
      <div className="absolute bottom-16 md:bottom-20 left-0 w-full z-20 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
        <motion.div 
          key={`meta-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <span className="text-gold-accent font-inter text-[10px] md:text-xs uppercase tracking-[0.4em] mb-2 font-bold drop-shadow-md">
            {activeImage.category}
          </span>
          <h3 className="text-warm-ivory font-playfair text-3xl md:text-5xl tracking-wider drop-shadow-2xl">
            {activeImage.alt}
          </h3>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-30 flex items-center justify-between px-4 md:px-8 pointer-events-none">
        <button 
          onClick={handlePrev}
          className="pointer-events-auto w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/30 hover:bg-gold-accent hover:text-charcoal-black text-warm-ivory backdrop-blur-md border border-white/10 transition-all duration-300 transform -translate-x-4 md:translate-x-0 opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft size={32} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleNext}
          className="pointer-events-auto w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/30 hover:bg-gold-accent hover:text-charcoal-black text-warm-ivory backdrop-blur-md border border-white/10 transition-all duration-300 transform translate-x-4 md:translate-x-0 opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight size={32} strokeWidth={1.5} />
        </button>
      </div>

      <button 
        onClick={() => setIsLightboxOpen(true)}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-white/20 text-warm-ivory backdrop-blur-md border border-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Maximize image"
      >
        <Maximize2 size={20} />
      </button>

      <div className="absolute bottom-6 md:bottom-8 left-0 w-full z-30 flex justify-center gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? "w-8 bg-gold-accent shadow-[0_0_10px_rgba(201,162,77,0.5)]" : "w-2 bg-white/40 hover:bg-white"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-gold-accent transition-all z-50 p-2" onClick={() => setIsLightboxOpen(false)}>
              <X size={40} strokeWidth={1} />
            </button>
            
            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
              <img 
                  src={optimizeUrl(images[currentIndex].src)} 
                  alt={images[currentIndex].alt} 
                  className="max-w-full max-h-[85vh] object-contain drop-shadow-[0_0_100px_rgba(201,162,77,0.2)] pointer-events-auto shadow-2xl" 
                  onClick={(e) => e.stopPropagation()} 
              />
              <div className="absolute bottom-6 md:bottom-12 text-center pointer-events-auto">
                <p className="text-warm-ivory font-playfair text-xl md:text-3xl tracking-[0.2em] uppercase font-light drop-shadow-lg px-4">
                  {images[currentIndex].alt}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;