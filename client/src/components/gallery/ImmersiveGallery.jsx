import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GripHorizontal, LayoutGrid } from "lucide-react";

const ImmersiveGallery = ({ viewMode, setViewMode, items = [] }) => {
  // Gallery page should display only images.
  // YouTube videos are handled separately by the VideoGallery section.
  const displayItems = items
    .filter((item) => item?.type === "image")
    .map((item) => ({
      id: item._id,
      image: item.url,
      // Don't show tags (e.g. "Pre-Wedding Cinematic") as the big overlay title.
      title: "",
      location: "Featured Collection",
      year: "2025",
      type: item.type,
    }));

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen bg-charcoal-black flex items-center justify-center text-warm-ivory">
        <p>No gallery items found.</p>
      </div>
    );
  }

  return (
    <div className="bg-charcoal-black relative w-full">
      {/* Premium Gold Toggle */}
      <div className="fixed top-[80px] right-4 md:top-[100px] md:right-8 z-[60] flex items-center space-x-1 bg-[#0F0F0F]/80 backdrop-blur-md p-1.5 rounded-full border border-gold-accent/30 shadow-xl">
        <button
          onClick={() => setViewMode("masonry")}
          className={`p-2 rounded-full transition-all duration-300 ${
            viewMode === "masonry"
              ? "bg-gold-accent text-charcoal-black shadow-[0_0_12px_rgba(201,162,77,0.5)]"
              : "text-warm-ivory/60 hover:text-gold-accent hover:bg-white/5"
          }`}
          title="Masonry View"
        >
          <LayoutGrid size={18} className="md:w-5 md:h-5" />
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-full transition-all duration-300 ${
            viewMode === "grid"
              ? "bg-gold-accent text-charcoal-black shadow-[0_0_12px_rgba(201,162,77,0.5)]"
              : "text-warm-ivory/60 hover:text-gold-accent hover:bg-white/5"
          }`}
          title="Grid View"
        >
          <GripHorizontal size={18} className="md:w-5 md:h-5" />
        </button>
      </div>

      {/* Gallery Cards */}
      {displayItems.map((item, index) => (
        <Card
          key={item.id}
          item={item}
          index={index}
          total={displayItems.length}
        />
      ))}
    </div>
  );
};

const Card = ({ item, index, total }) => {
  // Check if this is the very first image in the gallery
  const isFirst = index === 0;

  return (
    <div className={`relative w-full bg-[#0F0F0F] flex flex-col md:justify-end border-b border-white/10 ${
      isFirst ? "h-[100dvh]" : "md:h-[100dvh]"
    }`}>
      
      {/* 1. The Image Container */}
      {/* If it's the first image, make it absolute to fill the screen. Otherwise, let it sit normally. */}
      <div className={`w-full flex items-center justify-center overflow-hidden bg-[#0F0F0F] ${
        isFirst ? "absolute inset-0 h-full" : "relative md:absolute md:inset-0 md:h-full"
      }`}>
        
        {/* Cinematic Blurred Background (Visible mainly on the first card or desktop) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover opacity-40 blur-[30px] scale-125 pointer-events-none"
          />
        </div>

        {/* Main Sharp Image */}
        {item.type === "video" ? (
          <video
            src={item.image}
            className="relative z-10 w-full max-h-[75vh] md:max-h-none h-auto md:h-full md:object-cover object-contain block"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img 
            src={item.image} 
            alt={item.title || "Gallery image"} 
            className="relative z-10 w-full max-h-[75vh] md:max-h-none h-auto md:h-full md:object-cover object-contain block drop-shadow-2xl" 
          />
        )}
        
        {/* Gradient Overlay (Always on for the first card so text is readable, Desktop only for the rest) */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#0F0F0F]/90 via-[#0F0F0F]/20 to-transparent pointer-events-none z-20 ${
          isFirst ? "block" : "hidden md:block"
        }`} />
      </div>

      {/* 2. The Text Content */}
      <div className={`z-30 w-full px-6 md:absolute md:bottom-0 md:left-0 md:px-16 md:pb-32 md:bg-transparent ${
        isFirst ? "absolute bottom-0 left-0 pb-16 pt-0 bg-transparent" : "relative py-8 bg-[#0F0F0F]"
      }`}>
        <p className="font-inter text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 md:mb-3 text-gold-accent font-semibold drop-shadow-md">
          {item.location} — {item.year}
        </p>
        {item.title?.trim() ? (
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-warm-ivory leading-tight max-w-4xl drop-shadow-lg">
            {item.title}
          </h2>
        ) : null}
      </div>

      {/* 3. Pagination Counter (01 / 10) */}
      <div className="absolute top-4 right-4 md:top-1/2 md:right-8 md:-translate-y-1/2 flex md:flex-col items-center gap-2 md:gap-4 z-40 bg-black/60 backdrop-blur-sm md:bg-transparent px-3 py-1.5 md:p-0 rounded-full md:rounded-none pointer-events-none">
        <span className="text-gold-accent font-inter text-xs md:text-sm font-bold drop-shadow-md">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="w-4 h-[1px] md:w-[2px] md:h-16 bg-white/30 rounded-full"></div>
        <span className="text-warm-ivory/70 font-inter text-xs md:text-sm font-medium drop-shadow-md">
          {String(total).padStart(2, '0')}
        </span>
      </div>

    </div>
  );
};

export default ImmersiveGallery;