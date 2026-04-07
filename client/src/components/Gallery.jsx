import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import axios from "axios";

const defaultGalleryImages = [
  { id: 1, src: "/img1.jpeg", alt: "Luxury Wedding Stories - Gift of Memories Studio", category: "The Ceremony" },
  { id: 2, src: "/img2.jpeg", alt: "Candid Portrait Sessions - Gift of Memories Studio", category: "Portraits" },
  { id: 3, src: "/img3.jpeg", alt: "Traditional Rituals Captured - Gift of Memories Studio", category: "Heritage" },
];

const Gallery = () => {
  const [images, setImages] = useState(defaultGalleryImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Helper to optimize Cloudinary delivery and force modern formats (WebP/AVIF)
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
            alt: img.altText || `Featured Photography Work - ${img.category || 'Gift of Memories'}`,
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
    <section id="portfolio" className="relative bg-[#080808] py-16 md:py-24 overflow-hidden border-y border-white/5">
      <div className="sr-only">
        <h2>Professional Photography Portfolio - Gift of Memories</h2>
        <p>Explore our curated archive of high-end wedding films and candid photography stories.</p>
      </div>

      <div className="container mx-auto px-4 lg:px-12 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 mb-4"
          >
          </motion.div>
          <h2 className="font-playfair text-4xl md:text-7xl text-warm-ivory font-bold tracking-tighter">
            Real <span className="italic text-gold-accent">Weding Stories</span>
          </h2>
        </div>

        <div className="relative group w-full max-w-6xl mx-auto aspect-[4/5] md:aspect-[16/9] lg:aspect-[21/9] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-white/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
            >
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img 
                  src={optimizeUrl(activeImage.src)} 
                  alt="" 
                  role="presentation"
                  className="w-full h-full object-cover blur-[80px] opacity-30 scale-125" 
                />
              </div>

              <img
                src={optimizeUrl(activeImage.src)}
                alt={activeImage.alt}
                className="relative z-10 w-full h-full object-contain p-4 md:p-8 lg:p-12 drop-shadow-2xl"
              />

              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 bg-gradient-to-t from-black/80 to-transparent z-20 flex flex-col items-start md:items-center text-left md:text-center">
                 <span className="text-gold-accent font-inter text-[9px] md:text-xs uppercase tracking-[0.4em] mb-2 font-bold drop-shadow-sm">
                   {activeImage.category}
                 </span>
                 <h3 className="text-warm-ivory font-playfair text-xl md:text-4xl italic font-light max-w-2xl leading-tight">
                   {activeImage.alt}
                 </h3>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 z-30 flex items-center justify-between px-2 md:px-6 pointer-events-none">
            <button 
              onClick={handlePrev}
              className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/20 hover:bg-gold-accent hover:text-black text-warm-ivory backdrop-blur-md border border-white/10 transition-all duration-300 transform -translate-x-4 md:translate-x-0 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} strokeWidth={1.5} />
            </button>
            <button 
              onClick={handleNext}
              className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/20 hover:bg-gold-accent hover:text-black text-warm-ivory backdrop-blur-md border border-white/10 transition-all duration-300 transform translate-x-4 md:translate-x-0 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={32} strokeWidth={1.5} />
            </button>
          </div>

          <button 
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-6 right-6 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-warm-ivory backdrop-blur-md border border-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Maximize image"
          >
            <Maximize2 size={20} />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? "w-8 bg-gold-accent" : "w-2 bg-white/20 hover:bg-white/40"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-gold-accent transition-all z-50 p-2" onClick={() => setIsLightboxOpen(false)}>
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
                  {images[currentIndex].category}
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