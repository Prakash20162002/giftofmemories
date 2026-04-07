import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import axios from "axios";

// Default fallback images
const defaultImages = [
  "/preimg1.jpeg",
  "/preimg2.jpeg",
  "/preimg3.jpeg",
  "/preimg4.jpeg",
  "/preimg5.jpeg",
  "/preimg6.jpg",
  "/nowimg3.jpg",
];

const Row = ({ images, direction, className = "" }) => {
  const rowRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });

  // FIX 1: The "Array Void" fix. 
  // We guarantee there are always enough images to fill the infinite scroll effect by multiplying the array.
  const safeImages = images && images.length > 0 ? images : defaultImages;
  const loopedImages = [...safeImages, ...safeImages, ...safeImages, ...safeImages];

  // We reduced the movement range slightly (-30%) so it doesn't scroll so fast that it runs out of images
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "left" ? ["0%", "-30%"] : ["-30%", "0%"],
  );

  return (
    <div
      ref={rowRef}
      // FIX 2: Tighter gaps on mobile (gap-4 mb-4)
      className={`flex gap-4 md:gap-8 mb-4 md:mb-8 overflow-hidden whitespace-nowrap ${className}`}
    >
      <motion.div style={{ x }} className="flex gap-4 md:gap-8 min-w-full">
        {loopedImages.map((src, i) => (
          <div
            // Fixed key warning by making it unique
            key={`${i}-${src}`}
            // FIX 3: Mobile sizing. Scaled down to 240x160 on mobile so multiple cards fit on screen!
            className="relative h-[160px] w-[240px] sm:h-[200px] sm:w-[300px] md:h-[300px] md:w-[450px] shrink-0 rounded-xl md:rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={src}
              alt="Gallery"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const ParallaxGallery = () => {
  const [images, setImages] = useState(defaultImages);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/homepage-gallery/section/parallax`,
        );
        if (response.data && response.data.length > 0) {
          setImages(response.data.map((img) => img.imageUrl));
        }
      } catch (error) {
        console.error("Error fetching parallax gallery images:", error);
      }
    };
    fetchImages();
  }, []);

  return (
    // Scaled down mobile padding
    <section className="py-16 md:py-24 bg-warm-ivory overflow-hidden relative">
      
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 mb-10 md:mb-16 text-center">
        <span className="text-gold-accent font-inter text-xs md:text-sm uppercase tracking-widest block mb-3 font-semibold">
          Visual Stories
        </span>
        <h2 className="font-playfair text-3xl sm:text-4xl md:text-6xl text-charcoal-black">
          Capturing Life's Canvas
        </h2>
      </div>

      {/* Gallery Wrapper with Edge Fades */}
      <div className="relative flex flex-col">
        
        {/* Cinematic Edge Gradients: Fades the left and right edges so images don't cut off harshly */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-warm-ivory to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-warm-ivory to-transparent z-10 pointer-events-none" />

        {/* Row 1: Left */}
        <Row images={images.slice(0, 5)} direction="left" />

        {/* Row 2: Right */}
        <Row images={images.slice(5, 10)} direction="right" />

        {/* Row 3: Left */}
        <Row images={images.slice(2, 7)} direction="left" />

        {/* Row 4: Right */}
        <Row images={images.slice(1, 6)} direction="right" />

        {/* FIX 4: Hidden on mobile to prevent "Scroll Death" fatigue, visible on Desktop */}
        <Row images={images.slice(3, 8)} direction="left" className="hidden md:flex" />
        <Row images={images.slice(0, 5)} direction="right" className="hidden md:flex" />
        <Row images={images.slice(4, 9)} direction="left" className="hidden lg:flex" />
        
      </div>
    </section>
  );
};

export default ParallaxGallery;