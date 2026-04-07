import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const ImageLightbox = ({
  selectedImage,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) => {
  // We use a local state to track direction for the sliding animation
  const [[page, direction], setPage] = useState([0, 0]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) {
        setPage([page + 1, 1]);
        onNext();
      }
      if (e.key === "ArrowLeft" && hasPrev) {
        setPage([page - 1, -1]);
        onPrev();
      }
    };

    if (selectedImage) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, onClose, onNext, onPrev, hasNext, hasPrev, page]);

  // FIX 1: AnimatePresence stays here. The conditional check moves inside.
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-charcoal-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close Button - Refined for Luxury Feel */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-warm-ivory/40 hover:text-gold-accent transition-all p-3 z-[110]"
            aria-label="Close"
          >
            <X size={28} strokeWidth={1.5} />
          </button>

          <div
            className="relative w-full max-w-5xl h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation - Hidden on mobile to let swipe take over */}
            {hasPrev && (
              <button
                onClick={() => { setPage([page - 1, -1]); onPrev(); }}
                className="hidden md:flex absolute left-[-80px] z-10 p-4 text-warm-ivory/30 hover:text-gold-accent transition-all"
              >
                <ChevronLeft size={48} strokeWidth={1} />
              </button>
            )}

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={selectedImage.id}
                  custom={direction}
                  // FIX 3: Added a slide animation based on direction
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {selectedImage.type === "video" ? (
                    <video
                      src={selectedImage.src}
                      controls
                      autoPlay
                      className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl"
                    />
                  ) : (
                    <img
                      src={selectedImage.src}
                      alt={selectedImage.caption || "Gallery Image"}
                      className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl select-none"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {hasNext && (
              <button
                onClick={() => { setPage([page + 1, 1]); onNext(); }}
                className="hidden md:flex absolute right-[-80px] z-10 p-4 text-warm-ivory/30 hover:text-gold-accent transition-all"
              >
                <ChevronRight size={48} strokeWidth={1} />
              </button>
            )}

            {/* Caption - Refined Typography */}
            {selectedImage.caption && (
              <div className="absolute bottom-4 left-0 w-full text-center">
                <p className="font-playfair italic text-warm-ivory/60 text-lg">
                  {selectedImage.caption}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;