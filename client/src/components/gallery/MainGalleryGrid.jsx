import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Maximize2 } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

const MainGalleryGrid = ({ activeFilter, viewMode, items = [] }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Memoize the mapping and filtering so it doesn't re-run on every hover/re-render.
  const filteredImages = useMemo(() => {
    const mapped = items
      .filter((item) => item?.type === "image") // Strictly images for this grid
      .map((item) => ({
        id: item._id,
        src: item.url,
        category: item.tags?.[0] || "Uncategorized",
        caption: item.title || "Gallery image",
        type: item.type,
        tags: item.tags || [],
      }));

    return activeFilter === "All"
      ? mapped
      : mapped.filter(
          (img) => img.tags.includes(activeFilter) || img.category === activeFilter
        );
  }, [items, activeFilter]);

  const handleImageClick = (index) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % filteredImages.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);

  return (
    <section className="py-8 md:py-16 bg-warm-ivory min-h-screen">
      {/* Container is slightly wider for the collage look */}
      <div className="container mx-auto px-2 md:px-6 lg:px-8">
        
        <motion.div
          layout
          className={
            viewMode === "masonry"
              // HIGH-END COLLAGE THEME: Multiple columns, very thin gaps (gap-1/gap-2), stacking seamlessly
              ? "columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1 md:gap-2 space-y-1 md:space-y-2"
              // STANDARD GRID: Uniform squares
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                layout
                key={image.id}
                // 1. Initial hidden state (slightly scaled down and invisible)
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                
                // 2. Animate when it enters the viewport (scrolling down)
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                
                // 3. Optional: 'viewport={{ once: true }}' means it only animates the first time you scroll past it
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                
                // 4. Exit animation for when you filter categories
                exit={{ opacity: 0, scale: 0.95 }}
                
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`relative group break-inside-avoid overflow-hidden cursor-pointer bg-white transition-all duration-500 ${
                  viewMode === "grid" 
                    ? "aspect-[4/5] rounded-2xl shadow-sm hover:shadow-2xl" 
                    : "h-auto rounded-[2px] md:rounded-sm hover:z-10 hover:shadow-xl"
                }`}
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.src}
                  alt={image.caption}
                  // Scale slightly on hover for an interactive feel
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Refined Luxury Hover Overlay */}
                <div className="absolute inset-0 bg-charcoal-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[2px]">
                   <div className="flex space-x-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-gold-accent hover:text-charcoal-black transition-colors">
                        <Eye size={18} strokeWidth={1.5} />
                      </div>
                      <div className="p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-gold-accent hover:text-charcoal-black transition-colors hidden md:block">
                        <Maximize2 size={18} strokeWidth={1.5} />
                      </div>
                   </div>
                   {/* Category Tag */}
                   <span className="mt-4 text-[9px] md:text-[10px] text-warm-ivory/90 uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                     {image.category}
                   </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white/30 rounded-3xl border border-dashed border-charcoal-black/10"
          >
            <p className="font-playfair italic text-2xl text-slate-gray">
              This collection is currently being curated.
            </p>
            <p className="text-sm font-inter text-slate-gray/60 mt-2">Please check back soon or try another category.</p>
          </motion.div>
        )}

        {/* Lightbox Component */}
        <ImageLightbox
          selectedImage={selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          hasNext={filteredImages.length > 1}
          hasPrev={filteredImages.length > 1}
        />
      </div>
    </section>
  );
};

export default MainGalleryGrid;